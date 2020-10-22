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
import Gridicon from 'calypso/components/gridicon';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

const getMembershipTerms = ( {
	subscription,
	translate,
	moment,
}: {
	subscription: any;
	translate: any;
	moment: any;
} ) => {
	/* $5 - never expires. */
	if ( subscription.end_date === null ) {
		return translate( '%(amount)s - never expires.', {
			args: {
				amount: formatCurrency( subscription.renewal_price, subscription.currency ),
			},
		} );
	}

	/* Renews every month for $5. Next renewal on November 22, 2020. */
	if ( subscription.renewal_interval ) {
		return translate( 'Renews every %(interval)s for %(amount)s. Next renewal on %(date)s.', {
			args: {
				interval: subscription.renewal_interval,
				amount: formatCurrency( subscription.renewal_price, subscription.currency ),
				date: moment( subscription.endDate ).format( 'LL' ),
			},
		} );
	}

	/* Renews at $5 on November 22, 2020. */
	/* I'm not sure we can have a renewal without an interval, so this might not get called. */
	return translate( 'Renews at %(amount)s on %(date)s.', {
		args: {
			amount: formatCurrency( subscription.renewal_price, subscription.currency ),
			date: moment( subscription.endDate ).format( 'LL' ),
		},
	} );
};

export default function MembershipItem( { subscription }: { subscription: any } ): JSX.Element {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	return (
		<CompactCard
			className="membership-item"
			key={ subscription.ID }
			href={ '/me/purchases/other/' + subscription.ID }
		>
			<span className="membership-item__wrapper">
				<div className="membership-item__icon">
					<Gridicon icon="credit-card" size={ 24 } />
				</div>
				<div className="membership-item__details">
					<div className="membership-item__title">{ subscription.title }</div>
					<div className="membership-item__site">
						{ translate( 'On %s', { args: subscription.site_title } ) }
					</div>
					<div className="membership-item__term-label">
						{ getMembershipTerms( { subscription, translate, moment } ) }
					</div>
				</div>
			</span>
		</CompactCard>
	);
}
