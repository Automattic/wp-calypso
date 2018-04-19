/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
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
