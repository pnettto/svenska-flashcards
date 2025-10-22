# Swedish Flashcards

An interactive web application for learning Swedish vocabulary using flashcards with two different learning modes.

## Features

- **Two Learning Modes:**
  - **Typing Mode**: Type Swedish translations for English words
  - **Flip Mode**: Click or press spacebar to reveal translations

- **Collection Management:** Create custom collections or load CSV files
- **Interactive Learning:** Configurable sessions (10-30 cards) with real-time statistics
- **Modern UI:** Responsive design with dark theme and keyboard navigation

## Quick Start

1. Open `index.html` in your web browser
2. Choose "Typing Mode" or "Flip Mode"
3. Select session length (10-30 cards)
4. Click "Start Flashcards" to begin

## File Structure

```
flashcards/
├── index.html          # Main application
├── styles.css          # Styling
├── script.js          # Functionality
└── README.md          # Documentation
```

## Creating Collections

1. Click "Create Collection" tab
2. Enter collection name
3. Add CSV data in format: `Swedish,English` or `Swedish;English`
4. Click "Save Collection"

**Example CSV:**
```csv
hej,hello
hus,house
katt,cat
bil,car
```

## Learning Modes

**Typing Mode:**
- See English word, type Swedish translation
- Instant feedback and automatic progression

**Flip Mode:**
- See Swedish word, reveal English translation
- Manually mark answers as correct/incorrect

## Keyboard Shortcuts

- **Space**: Show answer (Flip) or focus input (Typing)
- **Enter**: Focus answer input (Typing mode)
- **Right Arrow**: Mark correct
- **Left Arrow**: Mark incorrect

## Local Development

For CSV file support, use a local web server:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

Then navigate to `http://localhost:8000`

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Technologies

- **Alpine.js** - Reactive framework
- **CSS3** - Modern styling
- **HTML5** - Semantic markup
- **LocalStorage** - Data persistence

## Tips

1. Start with 10-15 cards per session
2. Use review feature for incorrect answers
3. Alternate between learning modes
4. Practice daily for best results

## Troubleshooting

**Collections not saving?** Check browser localStorage permissions and console for errors.

**CSV files not loading?** Use a local web server instead of opening HTML directly.

## License

MIT License - Open source and free to use.
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
