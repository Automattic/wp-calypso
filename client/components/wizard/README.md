# Wizard

`Wizard` is a component that leads the user through a series of pre-defined steps.
It keeps track of progress and enables navigating back or forward through the steps.

## Usage

```js
const components = {
	first: <First />,
	second: <Second />,
};
const steps = [ 'first', 'second' ];

<Wizard
	backText="Previous"
	basePath="/section/wizard"
	components={ components }
	forwardText="Next"
	steps={ steps }
	stepName="first"
/>;
```

## Props

The following props can be passed to the `Wizard` component:

- `backText`: (string) Link text for navigating to the previous step in the wizard.
- `basePath`: (string) Used when navigating between steps. The URL that the user is sent to will be constructed using
  `basePath`, `stepName`, and `baseSuffix` (see below).
- `baseSuffix`: (string) Used when navigating between steps. The URL that the user is sent to will be constructed using
  `basePath`, `stepName`, and `baseSuffix` (see below).
- `components`: (Object) Required - An object of React components that will be rendered at each step in the wizard. Each key should map to one of the values in the `steps` array (see below).
- `forwardText`: (string) Link text for navigating to the next step in the wizard.
- `hideBackLink`: (boolean) Whether to intentionally hide the back link.
- `hideForwardLink`: (boolean) Whether to intentionally hide the forward link.
- `hideNavigation`: (boolean) Whether to hide the navigation links.
- `onBackClick`: (function) A callback to be called when the "Back" navigation link is clicked.
- `onForwardClick`: (function) A callback to be called when the "Forward" navigation link is clicked.
- `steps`: (array) Required - An array of strings denoting each of the steps in the wizard.
- `stepName`: (string) Required - The name of the current step (one of the values in `steps`).

### Additional props

Any additional props will be passed to each individual step component.
