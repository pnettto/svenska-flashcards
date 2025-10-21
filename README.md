# Swedish Flashcards

An interactive web application for learning Swedish vocabulary using flashcards with two different learning modes.

## Features

- **Two Learning Modes:**
  - **Typing Mode**: Type the Swedish translation for English words
  - **Flip Mode**: Click or press spacebar to reveal translations

- **Collection Management:**
  - Create and save custom flashcard collections
  - Load pre-made vocabulary collections
  - Import CSV data in Swedish,English or Swedish;English format

- **Interactive Learning:**
  - Configurable session length (10-30 cards)
  - Real-time statistics tracking
  - Review incorrect answers
  - Keyboard shortcuts for efficient learning

- **Modern UI:**
  - Responsive design with dark theme
  - Smooth animations and transitions
  - Accessible interface with keyboard navigation

## Getting Started

### Prerequisites

- A modern web browser
- Local web server (optional, for CSV file loading)

### Installation

1. Clone or download the project files
2. Place all files in a web-accessible directory
3. Open `index.html` in your web browser

### File Structure

```
flashcards/
├── index.html          # Main application file
├── styles.css          # All CSS styles
├── script.js          # JavaScript functionality
├── README.md          # This file
└── [csv-files]/       # Optional CSV vocabulary files
```

## Usage

### Quick Start

1. Open the application in your browser
2. Choose between "Typing Mode" or "Flip Mode"
3. Select session length (10-30 cards)
4. Click "Start Flashcards" to begin learning

### Creating Collections

1. Click the "Create Collection" tab
2. Enter a name for your collection
3. Add CSV data in the format: `Swedish,English`
4. Click "Save Collection"

### CSV Format

The application accepts CSV data in two formats:
- Comma-separated: `hej,hello`
- Semicolon-separated: `hej;hello`

Example:
```csv
hej,hello
hus,house
katt,cat
bil,car
```

### Keyboard Shortcuts

During flashcard sessions:
- **Space**: Show answer (Flip mode) or focus input (Typing mode)
- **Enter**: Focus answer input (Typing mode)
- **Right Arrow**: Mark as correct
- **Left Arrow**: Mark as incorrect

## Learning Modes

### Typing Mode
- English word is displayed
- Type the Swedish translation
- Instant feedback on correctness
- Automatic progression after answering

### Flip Mode
- Swedish word is displayed
- Press spacebar or click to reveal English translation
- Manually mark answers as correct or incorrect
- Good for recognition practice

## Local Development

To run the application locally with CSV file support:

1. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   ```

2. Navigate to `http://localhost:8000`

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- **Alpine.js** - Reactive JavaScript framework
- **CSS3** - Modern styling with animations and grid layout
- **HTML5** - Semantic markup
- **LocalStorage** - Persistent collection storage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Tips for Effective Learning

1. **Start Small**: Begin with 10-15 cards per session
2. **Review Regularly**: Use the review feature for incorrect answers
3. **Mix Modes**: Alternate between typing and flip modes
4. **Create Custom Sets**: Make collections for specific topics
5. **Daily Practice**: Consistency is key for vocabulary retention

## Troubleshooting

**Collections not saving?**
- Ensure your browser allows localStorage
- Check browser console for errors

**CSV files not loading?**
- Use a local web server instead of opening HTML directly
- Check file paths are correct

**Keyboard shortcuts not working?**
- Ensure no input field is focused
- Check browser console for JavaScript errors
