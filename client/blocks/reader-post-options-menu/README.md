# Reader Post Options Menu

The button and overlay for the "ellipsis" options menu attached to a post.

## Props

- `post`: A reader post object
- `onBlock`: a callback to invoke when a post or site is blocked

## Usage

```jsx
function MyMenu() {
	return <ReaderPostOptionsMenu post={ post } />;
}
```

## Props

### `post`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

A Reader post object.

### `onBlock`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A callback to invoke when a post or site is blocked.
