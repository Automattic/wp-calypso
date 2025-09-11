import { MembershipSubscription, Site } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { formatDate } from 'date-fns';
import { useEffect, useState } from 'react';
import SiteIcon from '../../sites/site-icon';

export const MembershipTerms = ( { subscription }: { subscription: MembershipSubscription } ) => {
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

export const MembershipSiteLink = ( {
	subscription,
}: {
	subscription: MembershipSubscription;
} ) => {
	const siteUrl = subscription.site_url.replace( /^https?:\/\//, '' );

	return (
		<button
			className="membership-item__site-name purchase-item__link"
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

export const MembershipType = ( { subscription }: { subscription: MembershipSubscription } ) => {
	if ( subscription.end_date === null ) {
		return createInterpolateElement( __( 'Purchased from <MembershipSiteLink/>' ), {
			MembershipSiteLink: <MembershipSiteLink subscription={ subscription } />,
		} );
	}

	return createInterpolateElement( __( 'Subscription to <MembershipSiteLink/>' ), {
		MembershipSiteLink: <MembershipSiteLink subscription={ subscription } />,
	} );
};

export const MembershipIcon = ( { subscription }: { subscription: MembershipSubscription } ) => {
	const [ hasError, setErrors ] = useState( false );
	const [ site, setSite ] = useState< Site >();
	const siteId = subscription.site_id;

	useEffect( () => {
		async function fetchData() {
			const data = await fetch( 'https://public-api.wordpress.com/rest/v1.1/sites/' + siteId );

			data
				.json()
				.then( ( data ) => {
					setSite( data );
				} )
				.catch( ( err ) => setErrors( err ) );
		}

		fetchData();
	}, [ siteId ] );

	if ( site && ! hasError && site.icon ) {
		return <SiteIcon site={ site } size={ 36 } />;
	}

	return <></>;
};
