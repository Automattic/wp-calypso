import { MonetizeSubscription } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { isToday } from 'date-fns';
import SiteIcon from '../../components/site-icon';
import { Text } from '../../components/text';
import { formatDate, getRelativeTimeString, parseDateAsUTC } from '../../utils/datetime';

export const MonetizeSubscriptionTerms = ( {
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	const locale = useLocale();

	if ( subscription.end_date === null ) {
		return <>{ __( 'Never expires' ) }</>;
	}

	// Check if end_date is in the past
	const endDate = parseDateAsUTC( subscription.end_date );
	const isExpired = endDate < new Date();

	// Show "Expired" for past dates
	if ( isExpired ) {
		const isExpiredToday = isToday( endDate );
		const expiredTodayText = __( 'Expired today' );
		// translators: timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"
		const expiredFromNowText = sprintf( __( 'Expired %(timeSinceExpiry)s' ), {
			timeSinceExpiry: getRelativeTimeString( endDate ),
		} );

		return <Text intent="error">{ isExpiredToday ? expiredTodayText : expiredFromNowText }</Text>;
	}

	// Show renewal or expiry for future dates
	return (
		<>
			{ subscription.renew_interval === null
				? // translators: %(date)s is the date the subscription expires. Format is LL (e.g. January 1, 2020).
				  sprintf( __( 'Expires on %(date)s' ), {
						date: formatDate( endDate, locale, {
							dateStyle: 'long',
						} ),
				  } )
				: // translators: %(amount)s is the renewal price, %(date)s is the date the subscription renews. Format is LL (e.g. January 1, 2020).
				  sprintf( __( 'Renews at %(amount)s on %(date)s' ), {
						amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
						date: formatDate( endDate, locale, {
							dateStyle: 'long',
						} ),
				  } ) }
		</>
	);
};

export const MonetizeSiteLink = ( { subscription }: { subscription: MonetizeSubscription } ) => {
	const displayUrl = subscription.site_url.replace( /^https?:\/\//, '' );

	return (
		<ExternalLink href={ subscription.site_url } rel="noreferrer" title={ subscription.site_url }>
			{ displayUrl }
		</ExternalLink>
	);
};

export const MonetizeSubscriptionType = ( {
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	if ( subscription.end_date === null ) {
		return (
			<div>
				{ createInterpolateElement( __( 'Purchased from <MonetizeSiteLink/>' ), {
					MonetizeSiteLink: <MonetizeSiteLink subscription={ subscription } />,
				} ) }{ ' ' }
			</div>
		);
	}

	return (
		<div>
			{ createInterpolateElement( __( 'Subscription to <MonetizeSiteLink/>' ), {
				MonetizeSiteLink: <MonetizeSiteLink subscription={ subscription } />,
			} ) }{ ' ' }
		</div>
	);
};

export const MonetizeSubscriptionIcon = ( {
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	const siteId = subscription.site_id;

	const { data: site, isError: isError } = useQuery( siteByIdQuery( parseInt( siteId ) ) );

	if ( site && ! isError && site.icon ) {
		return <SiteIcon site={ site } size={ 36 } />;
	}

	return null;
};
