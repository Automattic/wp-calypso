# New Component Checklist

This checklist is used whenever someone wants to merge a new component to the system. The steps below are edited from Nathan Curtis’ [Component QA article](https://medium.com/eightshapes-llc/component-qa-in-design-systems-b18cb4decb9c).

Before you complete the steps below, please consider the reusability of the component by using this [flowchart](https://coggle.it/diagram/WtUSrld3uAYZHsn-/t/-/992b38cbe685d897b4aec6d0dd93cc4b47c06e0d4484eeb0d7d9a47fb2c48d94):

![New Component Flowchart](https://cldup.com/a-vP702FC1.png)
Credit: [original flowchart](https://coggle.it/diagram/V0hkiP976OIbGpy8/t/vanilla-pattern#e4f393) from the [Vanilla Framework](https://vanillaframework.io/).

## Visual Quality

Does the component apply visual style —color, typography, icons, space, borders, and more— using appropriate variables, and does it meet our visual guidelines?

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

## Documentation

Please use the [documentation template](component-readme-template.md) for documenting the new component.

## Example

Making an example component for each component is a very good idea.

The file of the example component should reside into a `/docs` folder in the same folder where the component is defined and its name should be `example.jsx`. For instance for the `<Popover />` component:

```
// component definition
- client/component/popover/index.jsx

// example component
- client/component/popover/docs/example.jsx
```

By convention the name of example component should ends with the `Example` word so for in the Popover case the name should be `PopoverExample`. To show the correct name on `/devdocs/design`, define the `displayName` for the example component:

```es6
class PopoverExample extends PureComponent {
	static displayName = 'PopoverExample';
	// ...
}
```

## Playground

Components will appear in the [Playground](/devdocs/playground) if they have the following requirements satisfied:

- An example Component in /components/component-name/docs/example.jsx
- An exampleCode property on the example Component
- An `export ComponentName from components/component-name` statement in `playground-scope.js`
- An `export ComponentName from components/component-name/docs/example.jsx` statement in `component-examples.jsx`

Components which satisfy these requirements will also have a playground appear in [Devdocs Design](/devdocs/design).
