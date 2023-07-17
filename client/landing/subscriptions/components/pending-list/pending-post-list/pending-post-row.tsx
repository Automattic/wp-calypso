import { Gridicon } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useMemo } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import TimeSince from 'calypso/components/time-since';
import { PendingSubscriptionSettingsPopover } from 'calypso/landing/subscriptions/components/settings';

export default function PendingPostRow( {
	id,
	date_subscribed,
	site_icon,
	post_title,
	post_url,
	post_excerpt,
	site_url,
	site_title,
}: Reader.PendingPostSubscription ) {
	const hostname = useMemo( () => new URL( post_url ).hostname, [ post_url ] );

	const { mutate: confirmPendingSubscription, isLoading: confirmingPendingSubscription } =
		SubscriptionManager.usePendingPostConfirmMutation();
	const { mutate: deletePendingSubscription, isLoading: deletingPendingSubscription } =
		SubscriptionManager.usePendingPostDeleteMutation();

	return (
		<div className="row-wrapper">
			<div className="row" role="row">
				<span className="post" role="cell">
					<div className="title">
						<a href={ post_url } target="_blank" rel="noreferrer noopener">
							{ post_title }
						</a>
					</div>
					<div className="excerpt">{ post_excerpt }</div>
				</span>
				<a href={ site_url } rel="noreferrer noopener" className="title-box" target="_blank">
					<span className="title-box" role="cell">
						<SiteIcon
							iconUrl={ site_icon }
							/* eslint-disable wpcalypso/jsx-gridicon-size */
							defaultIcon={ <Gridicon key="globe-icon" icon="globe" size={ 40 } /> }
							size={ 40 }
							alt={ site_title }
						/>
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
						onConfirm={ () => confirmPendingSubscription( { id } ) }
						onDelete={ () => deletePendingSubscription( { id } ) }
						confirming={ confirmingPendingSubscription }
						deleting={ deletingPendingSubscription }
					/>
				</span>
			</div>
		</div>
	);
}
