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
import { MembershipSubscription } from 'calypso/lib/purchases/types';

/**
 * Style dependencies
 */
import './style.scss';

const MembershipTerms = ( { subscription }: { subscription: MembershipSubscription } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	/* $5 - never expires. */
	if ( subscription.end_date === null ) {
		return (
			<div className="membership-item__term-label">
				{ translate( '%(amount)s - never expires.', {
					args: {
						amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
					},
				} ) }
			</div>
		);
	}

	/* Renews every month for $5. Next renewal on November 22, 2020. */
	if ( subscription.renew_interval ) {
		return (
			<div className="membership-item__term-label">
				{ translate( 'Renews every %(interval)s for %(amount)s. Next renewal on %(date)s.', {
					args: {
						interval: subscription.renew_interval,
						amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
						date: moment( subscription.end_date ).format( 'LL' ),
					},
				} ) }
			</div>
		);
	}

	/* Renews at $5 on November 22, 2020. */
	/* I'm not sure we can have a renewal without an interval, so this might not get called. */
	return (
		<div className="membership-item__term-label">
			{ translate( 'Renews at %(amount)s on %(date)s.', {
				args: {
					amount: formatCurrency( Number( subscription.renewal_price ), subscription.currency ),
					date: moment( subscription.end_date ).format( 'LL' ),
				},
			} ) }
		</div>
	);
};

export default function MembershipItem( {
	subscription,
}: {
	subscription: MembershipSubscription;
} ): JSX.Element {
	const translate = useTranslate();

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
					<MembershipTerms subscription={ subscription } />
				</div>
			</span>
		</CompactCard>
	);
}
