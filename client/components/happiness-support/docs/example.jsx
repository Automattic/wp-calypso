/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import HappinessSupport from 'calypso/components/happiness-support';

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
