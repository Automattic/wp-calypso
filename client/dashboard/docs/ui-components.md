# UI Components

## Overview

The dashboard follows a component-based architecture with a strong focus on leveraging the WordPress component system. The UI components are designed to be reusable, accessible, and consistent with the WordPress design language.

## Core Principles

1. **WordPress Components First**: Use `@wordpress/components` as the primary UI library
2. **Minimal CSS**: Avoid custom CSS as much as possible, preferring component composition
3. **TypeScript**: All components are written in TypeScript with proper typing
4. **Translation-ready**: All user-facing strings use the `@wordpress/i18n` package

## Placeholders

Use placeholder components such as `TextBlur`, `TextSkeleton`, or `CalloutSkeleton` instead of spinners.

Placeholders for asynchronous data fetching should be used judiciously. Some dashboard pages are "heavy" and asynchronous fetching may be needed to prevent multi-second load times. On the other hand, layout shifts or flashes of default or fallback content should be avoided as much as possible. A good strategy is to use a router's `loader` function to fetch just enough data to allow a component's layout to be rendered definitively. Asynchronous fetching can then fill in the details without causing layout shifts. Note: when `loader` functions are slow, their loading state is handled by the `Root` component (`client/dashboard/app/root`).

See this post on loaders: p58i-kIo-p2


## DataViews and DataForm

The dashboard relies heavily on two core components for data display and interaction:

- **DataViews**: A component for displaying lists in a tabular, grid or list format, allowing for sorting, filtering, and pagination.
- **DataForm**: A component for creating and editing data, providing a form-based interface for user input.

These components are part of the design system, if changes are required to implement specific pages, consider checking with the design team first. The solution could be either to adapt the design or implement a generic solution at the component level.

Relying on CSS overrides and hacks should be avoided as much as possible.

## Card, CardBody, CardHeader, CardFooter, CardDivider, CardMedia

Use the provided `Card` component (`client/dashboard/components/card`) instead of importing directly from `@wordpress/components`. 

Our custom `Card` component serves as a wrapper around the WordPress Card to reduce padding on small screen and ensure consistent spacing.

## Additional Layout Components

In addition to the core components, the dashboard includes several reusable layout components that help structure the UI. They are found in the `/client/dashboard/components` directory:

- **Page Layout**: The main container for every dashboard page.
- **Menu** and **Responsive Menu**: Reusable components to render mobile-friendly navigation menus.
- **DataViews Card**: A card component for displaying data views.
- **Overview Card**: Standard card for data display
- **Header Bar**: A reusable header bar component for displaying a header bar (main and secondary headers).
