# viewport

This package contains React helpers to identify and track changes to the viewport. This can be used for displaying different components depending on a desktop or mobile view.

For vanilla methods, please check the `@automattic/viewport` package.

## Usage

Using a hook:

```js
import { useMobileBreakpoint } from '@automattic/viewport-react';

export default function MyComponent( props ) {
	const isMobile = useMobileBreakpoint();
	return <div>Screen size: { isMobile ? 'mobile' : 'not mobile' }</div>;
}
```

Using a higher-order component:

```js
import { withMobileBreakpoint } from '@automattic/viewport-react';

class MyComponent extends React.Component {
	render() {
		const { isBreakpointActive: isMobile } = this.props;
		return <div>Screen size: { isMobile ? 'mobile' : 'not mobile' }</div>;
	}
}

export default withMobileBreakpoint( MyComponent );
```

## Supported hooks

- `useBreakpoint( breakpoint )`: Returns the current status for a breakpoint, and keeps it updated.
- `useMobileBreakpoint()`: Returns the current status for the mobile breakpoint, and keeps it updated.
- `useDesktopBreakpoint()`: Returns the current status for the desktop breakpoint, and keeps it updated.

## Supported higher-order components

- `withBreakpoint( breakpoint )( WrappedComponent )`: Returns a wrapped component with the current status for a breakpoint as the `isBreakpointActive` prop.
- `withMobileBreakpoint( WrappedComponent )`: Returns a wrapped component with the current status for the mobile breakpoint as the `isBreakpointActive` prop.
- `withDesktopBreakpoint( WrappedComponent )`: Returns a wrapped component with the current status for the desktop breakpoint as the `isBreakpointActive` prop.

## Supported breakpoints

- '<480px'
- '<660px'
- '<800px'
- '<960px'
- '<1040px'
- '<1280px'
- '<1400px'
- '>480px'
- '>660px'
- '>800px'
- '>960px'
- '>1040px'
- '>1280px'
- '>1400px'
- '480px-660px'
- '480px-960px'
- '660px-960px'

**Note**: As implemented in Calypso media query mixins, minimums are exclusive, while maximums are inclusive. i.e.:

- '>480px' is equivalent to `@media (min-width: 481px)`
- '<960px' is equivalent to `@media (max-width: 960px)`
- '480px-960px' is equivalent to `@media (max-width: 960px) and (min-width: 481px)`
