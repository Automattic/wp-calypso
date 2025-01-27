# Guided Tour Components

The guided tour components are used to create interactive tours within the application. These components help guide users through various features and functionalities.

## Components

### GuidedTour

Initializes and manages the state of the guided tour.

#### Props

- `defaultTourId` (string): The ID of the tour to start by default.

### GuidedTourStep

Represents an individual step in the guided tour.

#### Props

- `id` (string): The ID of the step.
- `tourId` (string): The ID of the tour this step belongs to.
- `context` (HTMLElement | null): The context element for the step.
- `className` (string): Additional class names for the step.
- `hideSteps` (boolean): Whether to hide the step count.
- `title` (JSX.Element | string): The title of the step.
- `description` (JSX.Element | string): The description of the step.

## Usage

To use the guided tour components, wrap your application with the `GuidedTourContextProvider` and define your tours and steps.
