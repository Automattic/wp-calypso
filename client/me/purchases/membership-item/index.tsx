/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { MembershipSubscription } from 'calypso/lib/purchases/types';
import SiteIcon from 'calypso/blocks/site-icon';

/**
 * Style dependencies
 */
import 'calypso/me/purchases/style.scss';

const MembershipTerms = ( { subscription }: { subscription: MembershipSubscription } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( subscription.end_date === null ) {
		return translate( 'Never expires' );
	}

	return translate( 'Renews at %(amount)s on %(date)s', {
		args: {
			amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
			date: moment( subscription.end_date ).format( 'LL' ),
		},
	} );
};

const SiteLink = ( { subscription } ) => {
	const translate = useTranslate();

	return (
		<button
			className="membership-item__site-name purchase-item__site-name"
			onClick={ ( event ) => {
				event.stopPropagation();
				event.preventDefault();
				window.location = subscription.site_url;
			} }
			title={ translate( 'Visit %(siteName)s', {
				args: {
					siteName: subscription.site_title,
				},
			} ) }
		>
			{ subscription.site_title }
		</button>
	);
};

const MemberShipType = ( { subscription } ) => {
	const translate = useTranslate();

	return subscription.end_date === null
		? translate( 'Purchased from {{site}}{{/site}}', {
				components: {
					site: <SiteLink subscription={ subscription } />,
				},
		  } )
		: translate( 'Subscription to {{site}}{{/site}}', {
				components: {
					site: <SiteLink subscription={ subscription } />,
				},
		  } );
};

export default function MembershipItem( {
	subscription,
}: {
	subscription: MembershipSubscription;
} ): JSX.Element {
	return (
		<CompactCard
			className="membership-item"
			key={ subscription.ID }
			href={ '/me/purchases/other/' + subscription.ID }
		>
			<div className="membership-item__wrapper purchases-layout__wrapper">
				<div className="membership-item__site purchases-layout__site">
					<SiteIcon size={ 24 } />
				</div>

				<div className="membership-item__information purchase-item__information purchases-layout__information">
					<div className="membership-item__title purchase-item__title">{ subscription.title }</div>
					<div className="membership-item__purchase-type purchase-item__purchase-type">
						<MemberShipType subscription={ subscription } />
					</div>
				</div>

				<div className="membership-item__status purchase-item__status purchases-layout__status">
					<MembershipTerms subscription={ subscription } />
				</div>

				<div className="membership-item__payment-method purchase-item__payment-method purchases-layout__payment-method" />
			</div>
		</CompactCard>
	);
}
