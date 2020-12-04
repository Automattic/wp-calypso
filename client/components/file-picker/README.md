# FilePicker

This component opens a native file picker when its children are clicked on.
It is a very thin wrapper around
[`component/file-picker`](https://github.com/component/file-picker)

## How to use

```js
import FilePicker from 'calypso/components/file-picker';

function render() {
	return (
		<FilePicker multiple accept="image/*" onPick={ console.log.bind( console ) }>
			<a href="https://wordpress.com">Select a few images!</a>
		</FilePicker>
	);
}
```

## Props

- `multiple`: (bool) Allow selecting multiple files (Defaults to `false`).
- `directory`: (bool) Allow selecting of a directory (Defaults to `false`).
- `accept`: (string) Content type MIME to accept. Wildcards (`*`) are supported.
- `onPick`: (func) Function to call when the user has selected one or more files.
