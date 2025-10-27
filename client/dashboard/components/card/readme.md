# Card Component

A wrapper component for `@wordpress/components` Card that provides responsive padding control.

## Overview

This is a temporary wrapper around the WordPress `Card` component to control its padding behavior. The original `@wordpress/components` Card doesn't provide built-in spacing controls, so this wrapper adds responsive padding functionality.

## Features

- **Responsive padding**: Automatically adjusts card size based on viewport
- **Small viewports**: Uses `small` size for medium and smaller screens
- **Larger viewports**: Uses the provided `size` prop or defaults to `medium`
- **Full compatibility**: Passes through all props to the underlying WordPress Card component

## Usage

```tsx
import Card from 'calypso/components/card';

<Card>
  <CardHeader>Card Title</CardHeader>
  <CardBody>Card content goes here</CardBody>
</Card>
```

## Props

All props are passed through to the underlying `@wordpress/components` Card component, with the addition of responsive size behavior.

## Note

This is a temporary solution until the WordPress components library provides better spacing controls. Consider migrating to the native WordPress Card component when spacing controls become available.

