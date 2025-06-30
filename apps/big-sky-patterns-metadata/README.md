# Pattern Metadata Sidebar

A WordPress plugin that adds a pattern metadata sidebar to the WordPress post editor, allowing users to configure metadata for patterns to guide intelligent pattern selection and layout decisions for the [Big Sky Plugin](https://github.com/Automattic/big-sky-plugin).

## Features

- **Current Pattern Attributes**: Configure alignment, text density, and media density for the current pattern
- **Preferred Next Pattern Attributes**: Set preferences for the next pattern's alignment, text density, and media density
- **WordPress Integration**: Seamlessly integrates with the WordPress block editor
- **Internationalization**: Full translation support
- **Modern UI**: Clean, accessible interface using WordPress components

## Installation

### From Source

1. Clone or download this repository
2. Navigate to the plugin directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the plugin:
   ```bash
   npm run build
   ```
5. Copy the entire plugin directory to your WordPress `wp-content/plugins/` folder
6. Activate the plugin through the WordPress admin

### Development

For development, use the watch mode:

```bash
npm start
```

This will watch for file changes and automatically rebuild the plugin.

## Usage

1. Create or edit a post in the WordPress block editor
2. Look for the "Pattern Metadata" sidebar (accessible via the sidebar toggle)
3. Configure the current pattern attributes:
   - **Alignment**: Default, Pull Left, Pull Right, Centered, Full Width
   - **Text Density**: Default, Light, Medium, Heavy
   - **Media Density**: Default, Light, Medium, Heavy
4. Configure preferred next pattern attributes with the same options
5. The metadata is automatically saved with your post

## Data Storage

The plugin stores pattern metadata as JSON in the `_pattern_metadata` post meta field:

```json
{
  "alignment": "centered",
  "textDensity": "medium",
  "mediaDensity": "light",
  "preferredNextAlignment": "pull-left",
  "preferredNextTextDensity": "heavy",
  "preferredNextMediaDensity": "medium"
}
```

## Development

### Project Structure

```
pattern-metadata-sidebar/
├── pattern-metadata-sidebar.php          # Main plugin file
├── package.json                          # wp-scripts configuration
├── src/
│   ├── index.js                          # Main entry point
│   ├── components/
│   │   └── pattern-metadata-sidebar/
│   │       ├── index.js                  # Main sidebar component
│   │       ├── post-integration.js       # WordPress plugin registration
│   │       └── style.scss                # Component styles
│   └── hooks/
│       └── use-pattern-metadata.js       # Custom React hook
├── build/                                # Compiled assets
```

### Available Scripts

- `npm run build` - Build the plugin for production
- `npm start` - Start development mode with hot reloading
- `npm run format` - Format code using Prettier
- `npm run lint:js` - Lint JavaScript files
- `npm run lint:css` - Lint CSS files
- `npm run lint:js:fix` - Fix JavaScript linting issues
- `npm run packages-update` - Update WordPress packages

### WordPress Integration

The plugin integrates with WordPress using:

- **Post Meta API**: Stores metadata using WordPress post meta
- **REST API**: Exposes metadata through WordPress REST API
- **Block Editor**: Integrates with the WordPress block editor
- **Data Stores**: Uses WordPress data stores for state management

## Requirements

- WordPress 6.0+
- PHP 7.4+
- Block editor (Gutenberg)
- Node.js 16+ (for development)

## Browser Support

- Modern browsers with ES6+ support
- WordPress admin browser compatibility

## Security

- Post meta access requires `edit_posts` capability
- Proper nonce verification for AJAX calls
- Sanitization of all user inputs
- JSON validation for metadata structure

## Internationalization

The plugin supports translations with the text domain `pattern-metadata-sidebar`. Translation files should be placed in the `languages/` directory.

## License

GPL v2 or later

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

For support, please create an issue in the repository or contact the plugin author.
