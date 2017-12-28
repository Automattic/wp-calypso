/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';
import HappinessSupport from 'client/components/happiness-support';

export default class extends React.Component {
	static displayName = 'HappinessSupport';

	render() {
		return (
			<Card>
				<HappinessSupport />
			</Card>
		);
	}
}
