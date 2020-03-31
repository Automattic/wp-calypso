/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PresenceButton from 'blocks/presence-button';
import { Card } from '@automattic/components';

export default class PresenceButtonExample extends React.Component {
	static displayName = 'PresenceButtonExample';

	render() {
		return (
			<div>
				<Card compact>
					<PresenceButton presenceCount={ 0 } />
				</Card>
				<Card compact>
					<PresenceButton presenceCount={ 42 } />
				</Card>
			</div>
		);
	}
}
