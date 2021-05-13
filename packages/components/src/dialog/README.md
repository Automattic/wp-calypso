# Dialog

A React component that provides support for modal dialogs.

Place the `Dialog` JSX element anywhere -- when it is rendered, the resulting DOM nodes for the dialog will be
appending to the `body` of the document.

The `onClose` property must be set, and should modify the parent's state such that the dialog's `isVisible` property
will be false when `render` is called.

By controlling the dialog's visibility through the `isVisible` property, the dialog component itself is responsible for
providing any CSS transitions to animate the opening/closing of the dialog. This also keeps the parent's code clean and
readable, with a minimal amount of boilerplate code required to show a dialog.

## Basic Usage

```js
class MyComponent extends React.Component {
	state = {
		showDialog: false,
	};

	render() {
		const { translate } = this.props;

		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'delete', label: translate( 'Delete Everything' ), isPrimary: true },
			<MyCustomButton />,
		];

		return (
			<div>
				<button onClick={ this.onShowDialog }>Show Dialog</button>

				<Dialog
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.onCloseDialog }
				>
					<h1>{ translate( 'Confirmation' ) }</h1>
					<p>{ translate( 'Do you want to delete everything?' ) }</p>
				</Dialog>
			</div>
		);
	}

	onShowDialog = () => {
		this.setState( { showDialog: true } );
	};

	onCloseDialog = ( action ) => {
		// action is the `action` property of the button clicked to close the dialog. If the dialog is closed
		// by pressing ESC or clicking outside of the dialog, action will be `undefined`

		this.setState( { showDialog: false } );
	};
}

ReactDom.render( <MyComponent />, document.getElementById( 'content' ) );
```

## `onClick` handlers for buttons

You can attach `onClick` handlers for dialog buttons. The `onClick` handler will be passed a function that when
called will close the dialog the dialog button is a member of.

```js
function render() {
	const { translate } = this.props;

	buttons = [
		{ action: 'more-options', label: translate( 'More Options…' ), onClick: this.onMoreOptions },
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'save', label: translate( 'Save' ), isPrimary: true },
	];

	return (
		<Dialog isVisible={ this.state.showDialog } buttons={ buttons } onClose={ this.onCloseDialog }>
			<h1>{ translate( 'Dialog Title' ) }</h1>
			<p>{ translate( 'Dialog content' ) }</p>
		</Dialog>
	);
}

onMoreOptions = ( closeDialog ) => {
	// call the passed in `closeDialog` function to close the dialog the dialog button is
	// a member of
};
```

## Custom Buttons

If you need more than can be provided by passing button props, you can also pass a ReactElement in the place of
the button spec. The ReactElement cannot close the dialog directly, but you could close the dialog by routing back
through the Dialog's host.

```js
function render() {
	const { translate } = this.props;

	const buttons = [ <MyCustomButton onAction={ this.onCustomButtonAction } /> ];

	return (
		<Dialog isVisible={ this.state.showDialog } buttons={ buttons } onClose={ this.onCloseDialog }>
			<h1>{ translate( 'Dialog Title' ) }</h1>
			<p>{ translate( 'Dialog content' ) }</p>
		</Dialog>
	);
}

function onCustomButtonAction() {
	this.setState( { showDialog: false } );
}
```

## Providing custom styling for a dialog

The dialog component renders the following DOM tree (simplified to only show structure and classes):

```html
<div class="dialog__backdrop">
	<div class="dialog">
		<div class="dialog__content">
			<!-- dialog children goes here -->
		</div>
		<div class="dialog__action-buttons">
			<!-- buttons go here -->
		</div>
	</div>
</div>
```

You can provide custom styling for a dialog by making use of the following properties:

- `baseClassName`: if you specify this, you are responsible for providing all the following classes for the dialog (you
  can `@extend` the base `dialog` SCSS classes if you just want to tweak things a bit):

  - `_baseClassName_`
  - `_baseClassName___backdrop`
  - `_baseClassName___content`
  - `_baseClassName___action-buttons`

- `additionalClassNames`: if you specify this, these additional class names will be applied to the dialog element
  (not the backdrop)

```js
function render() {
	const { translate } = this.props;

	return (
		<Dialog
			baseClassName="custom-dialog"
			additionalClassNames="critical error"
			isVisible={ this.state.showDialog }
			onClose={ this.onCloseDialog }
		>
			<h1>{ translate( 'Dialog Title' ) }</h1>
			<p>{ translate( 'Dialog content' ) }</p>
		</Dialog>
	);
}
```
