import { Gridicon } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { SiteSettings } from '../settings-popover';
import type {
	SiteSubscription,
	SiteSubscriptionDeliveryFrequency,
} from '@automattic/data-stores/src/reader/types';

export default function SiteRow( {
	blog_ID,
	name,
	site_icon,
	URL: url,
	date_subscribed,
	delivery_methods,
}: SiteSubscription ) {
	const moment = useLocalizedMoment();
	const since = useMemo(
		() => moment( date_subscribed ).format( 'LL' ),
		[ date_subscribed, moment ]
	);
	const deliveryFrequency = delivery_methods?.email
		?.post_delivery_frequency as SiteSubscriptionDeliveryFrequency;
	const hostname = useMemo( () => new URL( url ).hostname, [ url ] );
	const siteIcon = useMemo( () => {
		if ( site_icon ) {
			return <img className="icon" src={ site_icon } alt={ name } />;
		}
		return <Gridicon className="icon" icon="globe" size={ 48 } />;
	}, [ site_icon, name ] );

	const { mutate: updateDeliveryFrequency } =
		SubscriptionManager.useSiteDeliveryFrequencyMutation();
	const { mutate: unFollow } = SubscriptionManager.useSiteUnfollowMutation();

	return (
		<li className="row" role="row">
			<a href={ url } rel="noreferrer noopener" className="title-box">
				<span className="title-box" role="cell">
					{ siteIcon }
					<span className="title-column">
						<span className="name">{ name }</span>
						<span className="url">{ hostname }</span>
					</span>
				</span>
			</a>
			<span className="date" role="cell">
				{ since }
			</span>
			<span className="email-frequency" role="cell">
				{ deliveryFrequency }
			</span>
			<span className="actions" role="cell">
				<SiteSettings
					deliveryFrequency={ deliveryFrequency }
					onDeliveryFrequencyChange={ ( delivery_frequency ) =>
						updateDeliveryFrequency( { blog_id: blog_ID, delivery_frequency } )
					}
					onUnfollow={ () => unFollow( { blog_id: blog_ID } ) }
				/>
			</span>
		</li>
	);
}
