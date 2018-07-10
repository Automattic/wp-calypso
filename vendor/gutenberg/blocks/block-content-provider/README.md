BlockContentProvider
====================

An internal block component used in block content serialization to inject nested block content within the `save` implementation of the ancestor component in which it is nested. The component provides a pre-bound `BlockContent` component via context, which is used by the developer-facing `InnerBlocks.Content` component to render block content.

## Usage

```jsx
<BlockContentProvider innerBlocks={ innerBlocks }>
	{ blockSaveElement }
</BlockContentProvider>
```
