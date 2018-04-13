# New Component Checklist

Component QA is used whenever someone wants to merge a new component to the system. The steps below are from Nathan Curtis’ [Component QA article](https://medium.com/eightshapes-llc/component-qa-in-design-systems-b18cb4decb9c) and work more as a guideline.

## Visual Quality

Does the component apply visual style — color, typography, icons, space, borders, and more — using appropriate variables, and does it meet our visual guidelines?

## Accessibility

Has the design and implementation accounted for accessibility? Please use our [accessibility checklist](accessibility.md).

## Responsiveness

Does it incorporate responsive display patterns and behaviors as needed? Is the component designed from a mobile-first perspective? Do all touch interactions work as expected?

## Sufficient States & Variations

Does it cover all the necessary variations (primary, secondary, compact, menu button) and states (default, hover, active, disabled), given intended scope?

## Content Resilience

Is each dynamic word or image element resilient to too much, too little, and no content at all, respectively? For tabs, how long can labels be, and what happens when you run out of space?

## Composability

Does it fit well when placed next to or layered with other components to form a larger composition? For tabs, how can they be applied stacked with or on top of other components?

## Functionality

Do all behaviors function as expected? For responsive tabs, are gestures (for sliding left and right) and menus (for overflow tabs) behaving correctly in varied device settings?

## Browser Support

Has the component visual quality and accuracy been assessed across Safari, Chrome, Firefox, IE and other browsers across relevant devices? Please adhere to our [browser support requirements](./README.md#browser-support).