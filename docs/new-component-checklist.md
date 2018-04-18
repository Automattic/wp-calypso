# New Component Checklist

This checklist is used whenever someone wants to merge a new component to the system. The steps below are edited from Nathan Curtis’ [Component QA article](https://medium.com/eightshapes-llc/component-qa-in-design-systems-b18cb4decb9c).

Before you complete the steps below, please consider the reusability of the component by using this [flowchart](https://coggle.it/diagram/WtUSrld3uAYZHsn-/t/-/992b38cbe685d897b4aec6d0dd93cc4b47c06e0d4484eeb0d7d9a47fb2c48d94):

![New Component Flowchart](https://cldup.com/a-vP702FC1.png)
Credit: [original flowchart](https://coggle.it/diagram/V0hkiP976OIbGpy8/t/vanilla-pattern#e4f393) from the [Vanilla Framework](https://vanillaframework.io/).

## Visual Quality

Does the component apply visual style — color, typography, icons, space, borders, and more — using appropriate variables, and does it meet our visual guidelines?

## Accessibility

Has the design and implementation accounted for accessibility? Please use our [accessibility checklist](accessibility-checklist.md).

## Responsiveness

Does it incorporate responsive display patterns and behaviors as needed? Is the component designed from a mobile-first perspective? Do all touch interactions work as expected?

## Sufficient States & Variations

Does it cover all the necessary variations (primary, secondary, compact) and states (default, hover, active, disabled, loading), given intended scope?

## Content Resilience

Is each dynamic word or image element resilient to too much, too little, and no content at all, respectively? How long can labels be, and what happens when you run out of space?

## Composability

Does it fit well when placed next to or layered with other components to form a larger composition?

## Functionality

Do all behaviors function as expected? For responsive tabs, are menus (for overflow tabs) behaving correctly in varied device settings?

## Browser Support

Has the component visual quality and accuracy been assessed across Safari, Chrome, Firefox, IE, and other browsers across relevant devices? Please adhere to our [browser support requirements](../README.md#browser-support).