import { Gridicon } from '@automattic/components';
import { useMemo } from 'react';
import { SubscriptionManager } from 'calypso/../packages/data-stores/src';
import TimeSince from 'calypso/components/time-since';
import { PendingPostSettings } from '../../settings';
import type { PendingPostSubscription } from '@automattic/data-stores/src/reader/types';

export default function PendingPostRow( {
	id,
	date_subscribed,
	site_icon,
	post_title,
	post_url,
	post_excerpt,
	site_url,
	site_title,
}: PendingPostSubscription ) {
	const hostname = useMemo( () => new URL( post_url ).hostname, [ post_url ] );
	const siteIcon = useMemo( () => {
		if ( site_icon ) {
			return <img className="icon" src={ site_icon } alt={ post_title } />;
		}
		return <Gridicon className="icon" icon="globe" size={ 48 } />;
	}, [ site_icon, post_title ] );

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
						{ siteIcon }
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
					<PendingPostSettings
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
