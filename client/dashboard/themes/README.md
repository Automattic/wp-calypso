# Dashboard Themes

This directory contains theme files for different dashboard applications. Each theme file defines CSS Custom Properties (variables) that control the visual appearance of the dashboard.

## Available Themes

- `dotcom.scss`: Styling for the WordPress.com dashboard
- `a4a.scss`: Styling for the Automattic for Agencies dashboard

## Usage

Each app entry point should import its corresponding theme file before importing the main dashboard styles:

```tsx
// For dotcom
import './themes/dotcom.scss';
import './style.scss';

// For a4a
import './themes/a4a.scss';
import './style.scss';
```

## Adding New Custom Properties

To add a new configurable style property:

1. Add the CSS Custom Property to both theme files
2. Use the variable in your component stylesheets

The naming schema for the CSS Custom Properties: `--dashboard-<ELEMENT>__<CSS-PROPERTY>`.

## Adding a New Theme

To add a new theme:

1. Create a new SCSS file in this directory
2. Define all required CSS Custom Properties
3. Import the theme in your app's entry point
