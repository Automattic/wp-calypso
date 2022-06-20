import { PLAN_ANNUAL_PERIOD, PLAN_MONTHLY_PERIOD } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useMemo } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import type { Purchase } from 'calypso/lib/purchases/types';

interface Props {
	purchase: Purchase;
	siteId: number;
	offer: object;
}

const JetpackCancellationOfferStep: React.FC< Props > = ( props ) => {
	const { offer, purchase } = props;
	const translate = useTranslate();

	const interval = useMemo( () => {
		const periods = offer.discounted_periods;
		const billingInterval = purchase.billPeriodDays;

		switch ( billingInterval ) {
			case PLAN_MONTHLY_PERIOD:
				return translate( '%(count) months', { args: { count: periods } } );
			case PLAN_ANNUAL_PERIOD:
				if ( periods > 1 ) {
					return translate( '%(count) years', { args: { count: periods } } );
				}
				return translate( 'year' );
			default:
				if ( periods > 1 ) {
					return translate( '%(count) renewals', { args: { count: periods } } );
				}
				return translate( 'renewal' );
		}
	}, [ purchase, offer ] );

	return (
		<>
			<FormattedHeader
				headerText={ translate( 'Thanks for your feedback.' ) }
				subHeaderText={ translate(
					'We’d love to help make Jetpack work for you. Would the special offer below interest you?'
				) }
				align="center"
				isSecondary={ true }
			/>

			<div>
				<p>
					{ translate( 'Get %(discount)d%% off %(name)s for the next %(interval)s.', {
						args: {
							discount: offer.discount_percentage,
							name: purchase.productName,
							interval: interval,
						},
					} ) }
				</p>
			</div>
		</>
	);
};

export default JetpackCancellationOfferStep;
