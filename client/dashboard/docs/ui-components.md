# UI Components

## Overview

The dashboard prototype follows a component-based architecture with a strong focus on leveraging the WordPress component system. The UI components are designed to be reusable, accessible, and consistent with the WordPress design language.

## Core Principles

1. **WordPress Components First**: Use `@wordpress/components` as the primary UI library
2. **Minimal CSS**: Avoid custom CSS as much as possible, preferring component composition
3. **TypeScript**: All components are written in TypeScript with proper typing
4. **Translation-ready**: All user-facing strings use the `@wordpress/i18n` package

## DataViews and DataForm

The dashboard relies heavily on two core components for data display and interaction:
- **DataViews**: A component for displaying lists a tabular, grid or list format, allowing for sorting, filtering, and pagination.
- **DataForm**: A component for creating and editing data, providing a form-based interface for user input.

These components are part of the design system, if changes are required to implement specific pages, consider checking with the design team first. The solution could be either to adapt the design or implement a generic solution at the component level.

Relying on CSS overrides and hacks should be avoided as much as possible.

## Additional Layout Components

In addition to the core components, the dashboard includes several reusable layout components that help structure the UI. They are found in the `/client/dashboard/components` directory:

- **Page Layout**: The main container for every dashboard page.
- **Menu** and **Responsive Menu**: Reusable components to render mobile-friendly navigation menus.
- **DataViews Card**: A card component for displaying data views.
- **Overview Card**: Standard card for data display
- **Header Bar**: A reusable header bar component for displaying a header bar (main and secondary headers).

