# Track Component View

`<TrackComponentView />` is a React component used to help track when container components are seen by a user.
This is useful in cases where a container component conditionally renders. If children are
not rendered, this analytics event will not be fired.

## Usage

Render the component passing one or both of:

- Tracks: An `eventName` string and `eventProperties` object
- MC Stats: `statGroup` and `statName` strings

```jsx
<ContainerComponent>
	<TrackComponentView eventName={ eventName } eventProperties={ eventProperties } />
</ContainerComponent>;
```

It does not accept any children, nor does it render any elements to the page.
