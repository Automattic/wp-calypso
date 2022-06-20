import { PLAN_ANNUAL_PERIOD, PLAN_MONTHLY_PERIOD } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useMemo, useCallback } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TosText from 'calypso/me/purchases/manage-purchase/payment-method-selector/tos-text';
import { CancellationOffer } from 'calypso/state/cancellation-offers/types';
import type { Purchase } from 'calypso/lib/purchases/types';

interface Props {
	purchase: Purchase;
	siteId: number;
	offer: CancellationOffer;
}

const JetpackCancellationOffer: React.FC< Props > = ( props ) => {
	const { offer, purchase } = props;
	const translate = useTranslate();

	const interval = useMemo( () => {
		const periods = offer.discountedPeriods;
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

	const onClickAccept = useCallback( () => {
		return;
	}, [] );

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

			<div className="jetpack-cancellation-offer__card">
				<JetpackLogo className="jetpack-cancellation-offer__logo" full size={ 36 } />
				<p className="jetpack-cancellation-offer__headline">
					{ translate( 'Get %(discount)d%% off %(name)s for the next %(interval)s.', {
						args: {
							discount: offer.discountPercentage,
							name: purchase.productName,
							interval: interval,
						},
					} ) }
				</p>
				<p>
					{ translate( '%(discount)d%% discount will be applied next time you are billed.', {
						args: {
							discount: offer.discountPercentage,
						},
					} ) }
				</p>
				<p></p>
				<Button
					className="jetpack-cancellation-offer__accept-cta"
					primary
					onClick={ onClickAccept }
				>
					{ translate( 'Get discount*' ) }
				</Button>
				<p>
					<small>
						*<TosText />
					</small>
				</p>
			</div>
		</>
	);
};

export default JetpackCancellationOffer;
