/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import HappinessSupport from 'components/happiness-support';

export default React.createClass( {
	displayName: 'HappinessSupport',

	render() {
		return (
			<Card>
				<HappinessSupport />
			</Card>
		);
	}
} );
