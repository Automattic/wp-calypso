# EmbedDialog (JSX)

Component used to show an embedded URL in a dialog

## Props

- `embedUrl`: The URL of the content to show
- `isVisible`: Whether or not the dialog is visible
- `onCancel`: (required) Function to handle the close event
- `onUpdate`: (required) Function to handle the update event

---

## How to use

```js
import EmbedDialog from 'calypso/components/tinymce/plugins/embed/dialog';

function render() {
	return (
		<EmbedDialog
			embedUrl={ this.props.embedUrl }
			isVisible={ this.state.showDialog }
			onCancel={ this.onCancel }
			onUpdate={ this.onUpdate }
		/>
	);
}
```
