# ResponsiveToolBarGroup

This component is used to render a toggle group that collapses items that overflow the component width into more dropdown. On mobile viewports this menu no longer collapses and extends off the screen for swiping into view.

## How to use

```jsx
import Discover from 'calypso/my-sites/plugins/categories/responsive-toolbar-group';

<ResponsiveToolbarGroup onClick={ onClick } initial>
	<span> Item #1 </span>
	<span> Item #2 </span>
	<span> Item #3 </span>
	<span> Item #4 </span>
</ResponsiveToolbarGroup>;
```

## Props

- `children`[ReactChild]: A group of react components to be rendered.
- `className`[string]: A classname to add to the ToolBarGroupComponent. (optional).
- `hideRatio`[number]: The ratio in chich the components are considered to be hidden ([take a look at the IntersectionObserver docs](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#thresholds)) (optional).
- `showRatio`[number]: The ratio in chich the components are considered to be shown ([take a look at the IntersectionObserver docs](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#thresholds)) (optional).
- `rootMargin`[string]: take a look at ([take a look at the IntersectionObserver docs](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin)) (optional).
- `onClick`[( index: number) => void]: A callback function that receives the index of the children being clicked. (optional).
- `initialActiveIndex`[number]: The initial active index of the component. (optional).
- `swipeBreakpoint`[string]: The breakpoint used to switch to a mobile friendly version of the toolbar optimized for swiping with no menu collapse. (optional, defaults to "<660px")
