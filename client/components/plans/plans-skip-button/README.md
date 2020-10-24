# Plans Skip Button

Render a button that is labeled 'Start with Free', allowing a user to forego (paid) plans selection during creation of a new site, and use the Free plan instead. Note that it's up to the consuming component to pass an `onClick` event handler to actually provide the desired behavior.

## Props

- **onClick** — (required) Function that will be called on button click.

## Usage

```jsx
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansSkipButton from 'calypso/components/plans/plans-skip-button';

class PlansSkipButtonExample extends PureComponent {
	static displayName = 'PlansSkipButton';

	handleClick = () => {
		console.log( 'PlansSkipButton was clicked' );
	};

	render() {
		return <PlansSkipButton onClick={ this.handleClick } />;
	}
}

export default PlansSkipButtonExample;
```
