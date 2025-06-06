document.addEventListener('DOMContentLoaded', async function() {
  const status = document.getElementById('status');
  const recordBtn = document.getElementById('recordBtn');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const extractBtn = document.getElementById('extractBtn');
  const questionCount = document.getElementById('questionCount');
  const countSpan = document.getElementById('count');

  let isRecording = false;
  let recordedQuestions = [];

  // Check initial recording state
  await updateRecordingState();

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
  }

  function hideStatus() {
    status.style.display = 'none';
  }

  async function updateRecordingState() {
    try {
      const result = await chrome.storage.local.get(['isRecording', 'recordedQuestions']);
      isRecording = result.isRecording || false;
      recordedQuestions = result.recordedQuestions || [];

      updateUI();
    } catch (error) {
      console.error('Error getting recording state:', error);
    }
  }

  function updateUI() {
    if (isRecording) {
      recordBtn.textContent = 'Stop Recording';
      recordBtn.className = 'btn recording';
      copyAllBtn.style.display = 'inline-block';
      questionCount.style.display = 'block';
      countSpan.textContent = recordedQuestions.length;
      showStatus('Recording questions...', 'recording');
    } else {
      recordBtn.textContent = 'Start Recording';
      recordBtn.className = 'btn';
      copyAllBtn.style.display = recordedQuestions.length > 0 ? 'inline-block' : 'none';
      questionCount.style.display = recordedQuestions.length > 0 ? 'block' : 'none';
      countSpan.textContent = recordedQuestions.length;
      if (recordedQuestions.length > 0) {
        showStatus(`Recording stopped. ${recordedQuestions.length} questions recorded.`, 'info');
      } else {
        hideStatus();
      }
    }
  }

  recordBtn.addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('geeksforgeeks.org')) {
        showStatus('This extension only works on GeeksforGeeks.org', 'error');
        return;
      }

      if (isRecording) {
        // Stop recording
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: stopRecording
        });
        
        await chrome.storage.local.set({ isRecording: false });
        isRecording = false;
        showStatus(`Recording stopped. ${recordedQuestions.length} questions recorded.`, 'success');
      } else {
        // Start recording
        await chrome.storage.local.set({ isRecording: true, recordedQuestions: [] });
        recordedQuestions = [];
        
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: startRecording
        });
        
        isRecording = true;
        showStatus('Recording started. Navigate through questions.', 'recording');
      }
      
      updateUI();
    } catch (error) {
      console.error('Error toggling recording:', error);
      showStatus('Error toggling recording state', 'error');
    }
  });

  copyAllBtn.addEventListener('click', async function() {
    try {
      const result = await chrome.storage.local.get(['recordedQuestions']);
      const questions = result.recordedQuestions || [];
      
      if (questions.length === 0) {
        showStatus('No questions recorded', 'error');
        return;
      }

      const formattedOutput = questions.join('\n\n' + '='.repeat(50) + '\n\n');
      await navigator.clipboard.writeText(formattedOutput);
      showStatus(`${questions.length} questions copied to clipboard!`, 'success');
    } catch (error) {
      console.error('Error copying questions:', error);
      showStatus('Failed to copy questions to clipboard', 'error');
    }
  });

  extractBtn.addEventListener('click', async function() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('geeksforgeeks.org')) {
        showStatus('This extension only works on GeeksforGeeks.org', 'error');
        return;
      }

      showStatus('Extracting question...', 'info');

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractQuizData
      });

      const result = results[0].result;

      if (result.success) {
        await navigator.clipboard.writeText(result.data);
        showStatus('Question copied to clipboard!', 'success');
      } else {
        showStatus(result.error, 'error');
      }

    } catch (error) {
      console.error('Error:', error);
      showStatus('An error occurred while extracting the question', 'error');
    }
  });

  // Listen for storage changes to update UI
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local') {
      if (changes.recordedQuestions) {
        recordedQuestions = changes.recordedQuestions.newValue || [];
        updateUI();
      }
    }
  });
});

// Functions to be injected into the page
function startRecording() {
  // Set up question monitoring
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
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  function checkForQuestionChange() {
    const question = extractCurrentQuestion();
    if (question) {
      const questionHash = hashString(question);
      if (questionHash !== currentQuestionHash) {
        currentQuestionHash = questionHash;
        
        // Store the question
        chrome.storage.local.get(['recordedQuestions'], function(result) {
          let questions = result.recordedQuestions || [];
          
          // Check for duplicates
          const isDuplicate = questions.some(q => hashString(q) === questionHash);
          
          if (!isDuplicate) {
            questions.push(question);
            chrome.storage.local.set({ recordedQuestions: questions });
            
            // Show notification
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 10px 15px;
              background-color: #27ae60;
              color: white;
              border-radius: 5px;
              font-family: Arial, sans-serif;
              font-size: 14px;
              z-index: 999999;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            `;
            notification.textContent = `Question recorded! (${questions.length} total)`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
              if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
              }
            }, 2000);
          }
        });
      }
    }
  }

  // Initial check
  checkForQuestionChange();

  // Set up observer for DOM changes
  observer = new MutationObserver(function(mutations) {
    let shouldCheck = false;
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        shouldCheck = true;
      }
    });
    
    if (shouldCheck) {
      setTimeout(checkForQuestionChange, 100); // Debounce
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Store observer reference
  window.gfgQuizObserver = observer;
  
  // Show start notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: #3498db;
    color: white;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  notification.textContent = 'Recording started! Navigate through questions.';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function stopRecording() {
  // Stop the observer
  if (window.gfgQuizObserver) {
    window.gfgQuizObserver.disconnect();
    window.gfgQuizObserver = null;
  }
  
  // Show stop notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: #e74c3c;
    color: white;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  notification.textContent = 'Recording stopped!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

function extractQuizData() {
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
      return { success: false, error: 'Quiz question not found. Make sure you\'re on a quiz page.' };
    }

    let questionText = questionBody.textContent.trim();
    questionText = questionText.replace(/\s+/g, ' ').trim();

    if (!questionText) {
      return { success: false, error: 'Question text is empty.' };
    }

    const choiceElements = document.querySelectorAll('.QuizRadioBtn_helper_text__7SNt_');
    if (choiceElements.length === 0) {
      return { success: false, error: 'Quiz choices not found.' };
    }

    const choices = [];
    choiceElements.forEach((element) => {
      let choiceText = element.textContent.trim();
      choiceText = choiceText.replace(/\s+/g, ' ').trim();
      if (choiceText) {
        choices.push(choiceText);
      }
    });

    if (choices.length === 0) {
      return { success: false, error: 'No valid choices found.' };
    }

    let formattedOutput = `Question: ${questionText}\n`;
    
    choices.forEach((choice, index) => {
      let cleanChoice = choice.replace(/^[a-d]\)\s*/, '').trim();
      const optionLetter = String.fromCharCode(97 + index);
      formattedOutput += `${optionLetter}) ${cleanChoice}\n`;
    });

    return { success: true, data: formattedOutput.trim() };

  } catch (error) {
    console.error('Error in extractQuizData:', error);
    return { success: false, error: 'An error occurred while parsing the page.' };
  }
}