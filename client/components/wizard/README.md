Wizard
======
`Wizard` is a component that leads the user through a series of pre-defined steps.
It keeps track of progress and enables navigating back or forward through the steps.

## Usage

```js
const components = {
	'first': <First />,
	'second': <Second />,
};
const steps = [ 'first', 'second' ];

<Wizard
	backText="Previous"
	basePath="/section/wizard"
	components={ components }
	forwardText="Next"
	steps={ steps }
	stepName="first" />
```

## Props

The following props can be passed to the `Wizard` component:

### `backText`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Link text for navigating to the previous step in the wizard.

### `basePath`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Used when navigating between steps. The URL that the user is sent to will be constructed using
`basePath`, `stepName`, and `baseSuffix` (see below).

### `baseSuffix`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Used when navigating between steps. The URL that the user is sent to will be constructed using
`basePath`, `stepName`, and `baseSuffix` (see below).

### `components`

<table>
	<tr><td>Type</td><td>Object</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

An object of React components that will be rendered at each step in the wizard. Each key should map
to one of the values in the `steps` array (see below).

### `forwardText`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Link text for navigating to the next step in the wizard.

### `hideNavigation`

<table>
	<tr><td>Type</td><td>Boolean</td></tr>
	<tr><td>Required</td><td>No</td></tr>
</table>

Whether to hide the navigation links.

### `steps`

<table>
	<tr><td>Type</td><td>Array</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

An array of strings denoting each of the steps in the wizard.

### `stepName`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>Yes</td></tr>
</table>

The name of the current step (one of the values in `steps`).
