/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import MembershipItem from '../membership-item';
import { MembershipSubscriptionsSite, MembershipSubscription } from 'calypso/lib/purchases/types';

export default function MembershipSite( {
	site,
}: {
	site: MembershipSubscriptionsSite;
} ): JSX.Element {
	return (
		<div className="membership-site">
			{ site.subscriptions.map( ( subscription: MembershipSubscription ) => (
				<MembershipItem subscription={ subscription } key={ subscription.ID } />
			) ) }
		</div>
	);
}
