# Plans Skip Button.

Render a button that allows a user to forego (paid) plans selection during creation of a new site, and use the Free plan instead.

## Props 

* **isRtl** — (optional) Whether the button should be rendered for a Right-to-Left locale.
* **onClick** — (required) Function that will be called on button click.

## Usage

```jsx
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PlansSkipButton from '..';

class PlansSkipButtonExample extends PureComponent {
	static displayName = 'PlansSkipButton';

	handleClick = () => {
		console.log( 'PlansSkipButton was clicked' );
	};

	render() {
		return (
			<Card>
				<PlansSkipButton onClick={ this.handleClick } />
			</Card>
		);
	}
}

export default PlansSkipButtonExample;
```