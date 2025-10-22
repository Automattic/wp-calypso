import { MonetizeSubscription } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import SiteIcon from '../../components/site-icon';
import { formatDate } from '../../utils/datetime';

export const MonetizeSubscriptionTerms = ( {
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	const locale = useLocale();

	if ( subscription.end_date === null ) {
		return <>{ __( 'Never expires' ) }</>;
	}

	return (
		<>
			{ subscription.renew_interval === null
				? // translators: %(date)s is the date the subscription expires. Format is LL (e.g. January 1, 2020).
				  sprintf( __( 'Expires on %(date)s' ), {
						date: formatDate( new Date( Date.parse( subscription?.end_date ?? '' ) ), locale, {
							dateStyle: 'long',
						} ),
				  } )
				: // translators: %(siteUrl)s is the URL of the site. %(date)s is the date the subscription renews. . Format is LL (e.g. January 1, 2020).
				  sprintf( __( 'Renews at %(amount)s on %(date)s' ), {
						amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
						date: formatDate( new Date( Date.parse( subscription?.end_date ?? '' ) ), locale, {
							dateStyle: 'long',
						} ),
				  } ) }
		</>
	);
};

export const MonetizeSiteLink = ( { subscription }: { subscription: MonetizeSubscription } ) => {
	const siteUrl = subscription.site_url.replace( /^https?:\/\//, '' );

	return (
		<ExternalLink href={ siteUrl } rel="noreferrer" title={ siteUrl }>
			{ siteUrl }
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
