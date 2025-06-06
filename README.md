# GFG Blessed 🚀

A powerful Chrome extension that automatically records and extracts quiz questions from GeeksforGeeks, making it easier to collect questions for study, practice, or creating question banks.

## ✨ Features

### 🎯 **Automatic Question Recording**
- **Smart Recording Mode**: Click to start recording and automatically capture questions as you navigate through GeeksforGeeks quizzes
- **Real-time Detection**: Instantly detects when questions change and logs them automatically
- **Duplicate Prevention**: Automatically removes duplicate questions during recording to ensure a clean collection

### 📝 **Multi-Format Support**
- **Original Quiz Format**: Supports standard GeeksforGeeks quiz questions
- **Contest Format**: Compatible with GeeksforGeeks contest and competition questions
- **Flexible Detection**: Automatically identifies and adapts to different question layouts

### 💾 **Question Management**
- **Bulk Export**: Copy all recorded questions to clipboard with proper formatting
- **Question Counter**: Real-time tracking of recorded questions
- **Formatted Output**: Clean, readable format with labeled options (a, b, c, d)

### ⚡ **Quick Actions**
- **Manual Extraction**: Extract current question immediately without recording
- **Keyboard Shortcuts**: 
  - `Ctrl+Shift+E`: Extract current question
  - `Ctrl+Shift+R`: Toggle recording mode
- **Visual Feedback**: Toast notifications for all actions and status updates

## 🎯 Use Cases

### 📚 **For Students**
- **Study Materials**: Build personal question banks for exam preparation
- **Practice Sets**: Collect questions from multiple topics for focused practice
- **Revision Notes**: Create comprehensive question collections for quick review

### 👨‍🏫 **For Educators**
- **Question Banks**: Build extensive question databases for teaching
- **Assignment Creation**: Quickly gather questions for homework and tests
- **Course Material**: Compile questions for different programming topics

### 💼 **For Interview Preparation**
- **Coding Interview Prep**: Collect relevant technical questions
- **Topic-wise Practice**: Organize questions by programming concepts
- **Mock Test Creation**: Build custom practice sets for interview preparation

### 🏢 **For Content Creators**
- **Blog Content**: Gather questions for programming tutorials and blogs
- **Course Development**: Collect questions for online programming courses
- **Educational Resources**: Build question sets for educational content

## 🛠️ Installation

Since this extension is not published on the Chrome Web Store, you'll need to install it manually in Developer Mode.

### Prerequisites
- Google Chrome browser
- Basic knowledge of Chrome Developer Mode

### Step-by-Step Installation

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-username/gfg-blessed.git
   cd gfg-blessed
   ```

2. **Enable Developer Mode in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle **"Developer mode"** in the top-right corner

3. **Load the Extension**
   - Click **"Load unpacked"** button
   - Navigate to the downloaded extension folder
   - Select the folder containing `manifest.json`
   - Click **"Select Folder"**

4. **Verify Installation**
   - The extension should now appear in your extensions list
   - You should see the GFG Blessed icon in your Chrome toolbar
   - Pin the extension for easy access

### 🔧 Alternative Installation (ZIP Download)

If you prefer to download as ZIP:

1. Download the repository as ZIP from GitHub
2. Extract the ZIP file to a folder
3. Follow steps 2-4 from above

## 📖 Usage Guide

### 🎬 **Getting Started**

1. **Navigate to GeeksforGeeks**
   - Go to any GeeksforGeeks quiz or contest page
   - Make sure you're on a page with quiz questions

2. **Start Recording**
   - Click the GFG Blessed extension icon in your toolbar
   - Click **"Start Recording"** button
   - You'll see a confirmation notification

3. **Navigate Through Questions**
   - Go through questions normally (next/previous buttons)
   - The extension automatically detects and records each unique question
   - Watch the question counter update in real-time

4. **Stop and Export**
   - Click **"Stop Recording"** when done
   - Click **"Copy All Questions"** to copy to clipboard
   - Paste the questions into your preferred text editor or document

### ⌨️ **Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+E` | Extract current question immediately |
| `Ctrl+Shift+R` | Toggle recording mode on/off |

### 📋 **Output Format**

Questions are formatted as follows:

```
Question: Which feature of React makes it efficient for updating user interfaces?
a) Virtual DOM
b) MVC architecture
c) Server-side rendering
d) Two-way data binding

==================================================

Question: What is the time complexity of binary search?
a) O(n)
b) O(log n)
c) O(n log n)
d) O(1)
```

## 🔧 Technical Details

### **Supported Question Formats**
- Standard GeeksforGeeks quiz questions (`.track_question_body__h3bjS`)
- Contest/Competition questions (`.contest_question_body__2MfHM`)
- Both formats use the same choice selector (`.QuizRadioBtn_helper_text__7SNt_`)

### **Browser Compatibility**
- Chrome (Manifest V3)
- Chromium-based browsers (Edge, Brave, etc.)

### **Permissions Required**
- `activeTab`: Access current GeeksforGeeks tab
- `scripting`: Inject content scripts for question detection
- `storage`: Save recorded questions locally

## 🐛 Troubleshooting

### **Extension Not Working?**
- Ensure you're on a GeeksforGeeks page (`*.geeksforgeeks.org`)
- Refresh the page after installing the extension
- Check if Developer Mode is enabled in Chrome

### **Questions Not Being Detected?**
- Make sure you're on a quiz page with visible questions
- Try manually extracting a question first
- Check browser console for any error messages

### **Recording Not Starting?**
- Verify you have the latest version of the extension
- Try using the keyboard shortcut `Ctrl+Shift+R`
- Reload the extension from `chrome://extensions/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### **Development Setup**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GeeksforGeeks for providing an excellent platform for programming practice
- Chrome Extensions API documentation and community

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the troubleshooting section above
- Make sure you're using the latest version

---

**⭐ If this extension helps you, please give it a star on GitHub!**

Made with ❤️ for the programming community