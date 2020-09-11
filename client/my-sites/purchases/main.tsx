/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Subscriptions from './subscriptions';

export default function Purchases() {
	return (
		<Main className="purchases">
			<Subscriptions />
		</Main>
	);
}
