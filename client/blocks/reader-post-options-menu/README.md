# Reader Post Options Menu

The button and overlay for the "ellipsis" options menu attached to a post.

## Props

- `post`: A Reader post object
- `onBlock`: a callback to invoke when a post or site is blocked

## Usage

```jsx
function MyMenu() {
	return <ReaderPostOptionsMenu post={ post } />;
}
```

## Props

### `post`

| Type   | Required |
| ------ | -------- |
| object | yes      |

A Reader post object.

### `onBlock`

| Type     | Required |
| -------- | -------- |
| function | no       |

A callback to invoke when a post or site is blocked.
