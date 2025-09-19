import { MonetizeSubscription } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { formatDate } from 'date-fns';
import SiteIcon from '../../sites/site-icon';

export const MonetizeSubscriptionTerms = ( {
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	if ( subscription.end_date === null ) {
		return <>{ __( 'Never expires' ) }</>;
	}

	return (
		<>
			{ subscription.renew_interval === null
				? // eslint-disable-next-line @wordpress/i18n-translator-comments
				  sprintf( __( 'Expires on %(date)s' ), {
						date: formatDate( subscription.end_date, 'LL' ),
				  } )
				: // eslint-disable-next-line @wordpress/i18n-translator-comments
				  sprintf( __( 'Renews at %(amount)s on %(date)s' ), {
						amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
						date: formatDate( subscription.end_date, 'LL' ),
				  } ) }
		</>
	);
};

export const MonetizeSiteLink = ({
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	const siteUrl = subscription.site_url.replace( /^https?:\/\//, '' );

	return (
		<button
			onClick={ ( event ) => {
				event.stopPropagation();
				event.preventDefault();
				window.location.href = subscription.site_url;
			} }
			title={ String(
				// eslint-disable-next-line @wordpress/i18n-translator-comments
				sprintf( __( 'Visit %(siteUrl)s' ), {
					siteUrl: subscription.site_url,
				} )
			) }
		>
			{ siteUrl }
		</button>
	);
};

export const MonetizeSubscriptionType = ( {
	subscription,
}: {
	subscription: MonetizeSubscription;
} ) => {
	if ( subscription.end_date === null ) {
		return createInterpolateElement( __( 'Purchased from <MonetizeSiteLink/>' ), {
			MonetizeSiteLink: <MonetizeSiteLink subscription={ subscription } />,
		} );
	}

	return createInterpolateElement( __( 'Subscription to <MonetizeSiteLink/>' ), {
		MonetizeSiteLink: <MonetizeSiteLink subscription={ subscription } />,
	} );
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

	return <></>;
};
