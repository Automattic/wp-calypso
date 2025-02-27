import { TimeSince } from '@automattic/components';
import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { useMemo } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { PendingSubscriptionSettingsPopover } from 'calypso/landing/subscriptions/components/settings';

export default function PendingSiteRow( {
	id,
	activation_key,
	site_title,
	site_icon,
	site_url,
	date_subscribed,
}: Reader.PendingSiteSubscription ) {
	const hostname = useMemo( () => new URL( site_url ).hostname, [ site_url ] );

	const { mutate: confirmPendingSubscription, isPending: confirmingPendingSubscription } =
		SubscriptionManager.usePendingSiteConfirmMutation();
	const { mutate: deletePendingSubscription, isPending: deletingPendingSubscription } =
		SubscriptionManager.usePendingSiteDeleteMutation();

	return (
		<li className="row" role="row">
			<a href={ site_url } rel="noreferrer noopener" className="title-box" target="_blank">
				<span className="title-box" role="cell">
					<SiteIcon iconUrl={ site_icon } size={ 40 } alt={ site_title } />
					<span className="title-column">
						<span className="name">{ site_title }</span>
						<span className="url">{ hostname }</span>
					</span>
				</span>
			</a>
			<span className="date" role="cell">
				<TimeSince
					date={
						( date_subscribed.valueOf() ? date_subscribed : new Date( 0 ) ).toISOString?.() ??
						date_subscribed
					}
				/>
			</span>
			<span className="actions" role="cell">
				<PendingSubscriptionSettingsPopover
					onConfirm={ () => confirmPendingSubscription( { id, activation_key } ) }
					onDelete={ () => deletePendingSubscription( { id } ) }
					confirming={ confirmingPendingSubscription }
					deleting={ deletingPendingSubscription }
				/>
			</span>
		</li>
	);
}
