Modal
=======

The modal is used to create an accessible modal over an application.

**Note:** The API for this modal has been mimicked to resemble [`react-modal`](https://github.com/reactjs/react-modal).

## Usage

Render a screen overlay with a modal on top.
```jsx
	<Modal
		title="My Modal"
		onRequestClose={ closeFunction }
		aria={ {
		    describedby: "modal-description",
		} }
	>
		<p id="modal-description">This modal is meant to be awesome!</p>
	</Modal>
```

## Implement close logic

For the modal to properly work it's important you implement the close logic for the modal properly. The following example shows you how to properly implement a modal.

```js
const { Component, Fragment } = wp.element;
const { Modal } = wp.components;

class MyModalWrapper extends Component {
	constructor() {
		super( ...arguments );
		this.state = {
			isOpen: true,
		}

		this.openModal = this.openModal.bind( this );
		this.closeModal = this.closeModal.bind( this );
	}
	
	openModal() {
		if ( ! this.state.isOpen ) {
			this.setState( { isOpen: true } );
		}
	}

	closeModal() {
		if ( this.state.isOpen ) {
			this.setState( { isOpen: false } );
		}
	}

	render() {
		return (
			<Fragment>
				<button onClick={ this.openModal }>Open Modal</button>
				{ this.state.isOpen ?
					<Modal
						title="This is my modal"
						onRequestClose={ this.closeModal }>
						<button onClick={ this.closeModal }>
						    My custom close button
						</button>
					</Modal> 
					: null }
			</Fragment>
		);
	}
}
```

## Props

The set of props accepted by the component will be specified below.
Props not included in this set will be applied to the input elements.

### title

This property is used as the modal header's title. It is required for accessibility reasons.

- Type: `String`
- Required: Yes

### onRequestClose

This function is called to indicate that the modal should be closed.

- Type: `function`
- Required: Yes

### contentLabel

If this property is added, it will be added to the modal content `div` as `aria-label`.
You are encouraged to use this if `aria.labelledby` is not provided.

- Type: `String`
- Required: No

### aria.labelledby

If this property is added, it will be added to the modal content `div` as `aria-labelledby`.
You are encouraged to use this when the modal is visually labelled.

- Type: `String`
- Required: No
- Default: `modal-heading`

### aria.describedby

If this property is added, it will be added to the modal content `div` as `aria-describedby`.

- Type: `String`
- Required: No

### focusOnMount

If this property is true, it will focus the first tabbable element rendered in the modal.

- Type: `bool`
- Required: No
- Default: true

### shouldCloseOnEsc

If this property is added, it will determine whether the modal requests to close when the escape key is pressed. 

- Type: `bool`
- Required: No
- Default: true

### shouldCloseOnClickOutside

If this property is added, it will determine whether the modal requests to close when a mouse click occurs outside of the modal content.

- Type: `bool`
- Required: No
- Default: true

### className

If this property is added, it will an additional class name to the modal content `div`.

- Type: `String`
- Required: No

### role

If this property is added, it will override the default role of the modal.

- Type: `String`
- Required: No
- Default: `dialog`

### overlayClassName

If this property is added, it will an additional class name to the modal overlay `div`.

- Type: `String`
- Required: No
