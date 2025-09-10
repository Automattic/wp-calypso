import { Site } from '@automattic/api-core';
import { CompactCard } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import SiteIcon from '../../sites/site-icon';
import { MembershipSubscription } from './types';

export const MembershipTerms = ( { subscription }: { subscription: MembershipSubscription } ) => {
	const moment = useLocalizedMoment();

	if ( subscription.end_date === null ) {
		return <>{ __( 'Never expires' ) }</>;
	}

	return (
		<>
			{ subscription.renew_interval === null
				? // eslint-disable-next-line @wordpress/i18n-translator-comments
				  sprintf( __( 'Expires on %(date)s' ), {
						date: moment( subscription.end_date ).format( 'LL' ),
				  } )
				: // eslint-disable-next-line @wordpress/i18n-translator-comments
				  sprintf( __( 'Renews at %(amount)s on %(date)s' ), {
						amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
						date: moment( subscription.end_date ).format( 'LL' ),
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
		return (
			<>
				__( 'Purchased from <MembershipSiteLink subscription={ subscription } /> ')
			</>
		);
	}

	return (
		<>
			__( 'Subscription to <MembershipSiteLink subscription={ subscription } />' )
		</>
	);
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

export default function MembershipItem( {
	subscription,
}: {
	subscription: MembershipSubscription;
} ) {
	return (
		<CompactCard
			className="membership-item"
			key={ subscription.ID }
			href={ '/me/purchases/other/' + subscription.ID }
		>
			<div className="membership-item__wrapper purchases-layout__wrapper">
				<div className="membership-item__site purchases-layout__site">
					<MembershipIcon subscription={ subscription } />
				</div>

				<div className="membership-item__information purchase-item__information purchases-layout__information">
					<div className="membership-item__title purchase-item__title">{ subscription.title }</div>
					<div className="membership-item__purchase-type purchase-item__purchase-type">
						<MembershipType subscription={ subscription } />
					</div>
				</div>

				<div className="membership-item__status purchase-item__status purchases-layout__status">
					<MembershipTerms subscription={ subscription } />
				</div>

				<div className="membership-item__payment-method purchase-item__payment-method purchases-layout__payment-method">
					{ __( 'Credit card' ) }
				</div>
			</div>
		</CompactCard>
	);
}
