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
			<div className="design-assets__group">
				<h2><a href="/devdocs/blocks/happiness-support">HappinessSupport</a></h2>
				<Card>
					<HappinessSupport />
				</Card>
			</div>
		);
	}
} );
