/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

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
