Observe Typing
==============

`<ObserveTyping />` is a component used in managing the editor's internal typing flag. When used to wrap content — typically the top-level block list — it observes keyboard and mouse events to set and unset the typing flag. The typing flag is used in considering whether the block border and controls should be visible. While typing, these elements are hidden for a distraction-free experience.

## Usage

Wrap the component where blocks are to be rendered with `<ObserveTyping />`:

```jsx
function VisualEditor() {
	return (
		<ObserveTyping>
			<BlockList />
		</ObserveTyping>
	);
}
```
