// Content script for GeeksforGeeks Quiz Extractor
// This script runs on GeeksforGeeks pages

// Add a keyboard shortcut for quick extraction
document.addEventListener('keydown', function(event) {
  // Ctrl+Shift+E (or Cmd+Shift+E on Mac) to extract question
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
    event.preventDefault();
    extractAndCopyQuiz();
  }
  
  // Ctrl+Shift+R (or Cmd+Shift+R on Mac) to toggle recording
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
    event.preventDefault();
    toggleRecording();
  }
});

async function toggleRecording() {
  try {
    const result = await chrome.storage.local.get(['isRecording']);
    const isRecording = result.isRecording || false;
    
    if (isRecording) {
      stopRecording();
      await chrome.storage.local.set({ isRecording: false });
      showNotification('Recording stopped via keyboard shortcut', 'info');
    } else {
      await chrome.storage.local.set({ isRecording: true, recordedQuestions: [] });
      startRecording();
      showNotification('Recording started via keyboard shortcut', 'success');
    }
  } catch (error) {
    console.error('Error toggling recording:', error);
    showNotification('Error toggling recording', 'error');
  }
}

function startRecording() {
  let currentQuestionHash = '';
  let observer = null;
  function extractCurrentQuestion() {
    try {
      // Try to find question using different selectors (supports multiple question formats)
      let questionBody = document.querySelector('.track_question_body__h3bjS');
      let questionFormat = 'original';
      
      // If original format not found, try the contest format
      if (!questionBody) {
        questionBody = document.querySelector('.contest_question_body__2MfHM');
        questionFormat = 'contest';
      }
      
      if (!questionBody) return null;

      let questionText = questionBody.textContent.trim();
      questionText = questionText.replace(/\s+/g, ' ').trim();

      if (!questionText) return null;

      const choiceElements = document.querySelectorAll('.QuizRadioBtn_helper_text__7SNt_');
      if (choiceElements.length === 0) return null;

      const choices = [];
      choiceElements.forEach((element) => {
        let choiceText = element.textContent.trim();
        choiceText = choiceText.replace(/\s+/g, ' ').trim();
        if (choiceText) {
          choices.push(choiceText);
        }
      });

      if (choices.length === 0) return null;

      let formattedOutput = `Question: ${questionText}\n`;
      choices.forEach((choice, index) => {
        let cleanChoice = choice.replace(/^[a-d]\)\s*/, '').trim();
        const optionLetter = String.fromCharCode(97 + index);
        formattedOutput += `${optionLetter}) ${cleanChoice}\n`;
      });

      return formattedOutput.trim();
    } catch (error) {
      console.error('Error extracting question:', error);
      return null;
    }
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  function checkForQuestionChange() {
    const question = extractCurrentQuestion();
    if (question) {
      const questionHash = hashString(question);
      if (questionHash !== currentQuestionHash) {
        currentQuestionHash = questionHash;
        
        chrome.storage.local.get(['recordedQuestions'], function(result) {
          let questions = result.recordedQuestions || [];
          
          const isDuplicate = questions.some(q => hashString(q) === questionHash);
          
          if (!isDuplicate) {
            questions.push(question);
            chrome.storage.local.set({ recordedQuestions: questions });
            showNotification(`Question recorded! (${questions.length} total)`, 'success');
          }
        });
      }
    }
  }

  checkForQuestionChange();

  observer = new MutationObserver(function(mutations) {
    let shouldCheck = false;
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        shouldCheck = true;
      }
    });
    
    if (shouldCheck) {
      setTimeout(checkForQuestionChange, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window.gfgQuizObserver = observer;
}

function stopRecording() {
  if (window.gfgQuizObserver) {
    window.gfgQuizObserver.disconnect();
    window.gfgQuizObserver = null;
  }
}

// Check if recording should be active on page load
chrome.storage.local.get(['isRecording'], function(result) {
  if (result.isRecording) {
    startRecording();
  }
});

function extractAndCopyQuiz() {
  try {
    // Look for the question body using different selectors (supports multiple formats)
    let questionBody = document.querySelector('.track_question_body__h3bjS');
    let questionFormat = 'original';
    
    // If original format not found, try the contest format
    if (!questionBody) {
      questionBody = document.querySelector('.contest_question_body__2MfHM');
      questionFormat = 'contest';
    }
    
    if (!questionBody) {
      showNotification('Quiz question not found. Make sure you\'re on a quiz page.', 'error');
      return;
    }

    // Extract question text
    let questionText = questionBody.textContent.trim();
    questionText = questionText.replace(/\s+/g, ' ').trim();

    if (!questionText) {
      showNotification('Question text is empty.', 'error');
      return;
    }

    // Look for choices
    const choiceElements = document.querySelectorAll('.QuizRadioBtn_helper_text__7SNt_');
    if (choiceElements.length === 0) {
      showNotification('Quiz choices not found.', 'error');
      return;
    }

    // Extract choices
    const choices = [];
    choiceElements.forEach((element) => {
      let choiceText = element.textContent.trim();
      choiceText = choiceText.replace(/\s+/g, ' ').trim();
      if (choiceText) {
        choices.push(choiceText);
      }
    });

    if (choices.length === 0) {
      showNotification('No valid choices found.', 'error');
      return;
    }

    // Format the output
    let formattedOutput = `Question: ${questionText}\n`;
    
    choices.forEach((choice, index) => {
      let cleanChoice = choice.replace(/^[a-d]\)\s*/, '').trim();
      const optionLetter = String.fromCharCode(97 + index);
      formattedOutput += `${optionLetter}) ${cleanChoice}\n`;
    });

    // Copy to clipboard
    navigator.clipboard.writeText(formattedOutput.trim()).then(() => {
      showNotification('Quiz question copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('Failed to copy to clipboard', 'error');
    });

  } catch (error) {
    console.error('Error in extractAndCopyQuiz:', error);
    showNotification('An error occurred while extracting the question.', 'error');
  }
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 999999;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: opacity 0.3s ease;
  `;

  if (type === 'success') {
    notification.style.backgroundColor = '#27ae60';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#e74c3c';
  } else {
    notification.style.backgroundColor = '#3498db';
  }

  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}