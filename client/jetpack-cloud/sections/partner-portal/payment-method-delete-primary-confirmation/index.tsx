import { PaymentLogo } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { QueryKey, useQuery } from 'react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { Dispatch, FunctionComponent, SetStateAction } from 'react';

import './style.scss';

const getCacheKey = ( key: string ): QueryKey => [ 'jetpack-cloud', 'partner-portal', key ];

interface Props {
	paymentMethod: PaymentMethod;
	setNextPrimaryPaymentMethod: Dispatch< SetStateAction< PaymentMethod | null > >;
}

const PaymentMethodDeletePrimaryConfirmation: FunctionComponent< Props > = ( {
	paymentMethod,
	setNextPrimaryPaymentMethod,
} ) => {
	const translate = useTranslate();

	const { data: recentCards, isFetching } = useQuery( getCacheKey( 'recent-cards' ), () =>
		wpcomJpl.req.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/stripe/payment-methods',
		} )
	);

	const nextPrimaryPaymentMethod = ( recentCards?.items || [] ).find(
		( card: PaymentMethod ) => card.id !== paymentMethod.id
	);

	useEffect( () => {
		setNextPrimaryPaymentMethod( nextPrimaryPaymentMethod );
	}, [ nextPrimaryPaymentMethod, setNextPrimaryPaymentMethod ] );

	if ( ! isFetching && ! nextPrimaryPaymentMethod ) {
		return <></>;
	}

	return (
		<div className="payment-method-delete-primary-confirmation">
			<div className="payment-method-delete-primary-confirmation__card">
				<div className="payment-method-delete-primary-confirmation__card-title">
					{ translate( 'Deleting' ) }
				</div>
				<div className="payment-method-delete-primary-confirmation__card-details">
					<div className="payment-method-delete-primary-confirmation__card-details-logo">
						<PaymentLogo brand={ paymentMethod?.card.brand } isSummary={ true } />
					</div>
					<div>**** **** **** { paymentMethod?.card.last4 }</div>
					<div>{ `${ paymentMethod?.card.exp_month }/${ paymentMethod?.card.exp_year }` }</div>
				</div>
			</div>

			<hr className="payment-method-delete-primary-confirmation__separator" />

			<div className="payment-method-delete-primary-confirmation__card">
				<div className="payment-method-delete-primary-confirmation__card-title">
					{ translate( 'Your primary payment method will automatically switch to' ) }
				</div>

				<div className="payment-method-delete-primary-confirmation__card-details">
					{ isFetching && (
						<div className="payment-method-delete-primary-confirmation__card-details-loader" />
					) }

					{ ! isFetching && (
						<>
							<div className="payment-method-delete-primary-confirmation__card-details-logo">
								<PaymentLogo brand={ nextPrimaryPaymentMethod?.card.brand } isSummary={ true } />
							</div>
							<div>**** **** **** { nextPrimaryPaymentMethod?.card.last4 }</div>
							<div>{ `${ nextPrimaryPaymentMethod?.card.exp_month }/${ nextPrimaryPaymentMethod?.card.exp_year }` }</div>
						</>
					) }
				</div>
			</div>
		</div>
	);
};

export default PaymentMethodDeletePrimaryConfirmation;
