import { MembershipSubscriptionsSite, MembershipSubscription } from 'calypso/lib/purchases/types';
import MembershipItem from '../membership-item';

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
