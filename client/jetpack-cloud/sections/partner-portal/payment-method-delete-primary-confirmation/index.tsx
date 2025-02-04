import { PaymentLogo } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { useRecentPaymentMethodsQuery } from 'calypso/jetpack-cloud/sections/partner-portal//hooks';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	paymentMethod: PaymentMethod;
}

const PaymentMethodDeletePrimaryConfirmation: FunctionComponent< Props > = ( {
	paymentMethod,
} ) => {
	const translate = useTranslate();

	const { data: recentCards, isFetching } = useRecentPaymentMethodsQuery();

	const nextPrimaryPaymentMethod = ( recentCards?.items || [] ).find(
		( card: PaymentMethod ) => card.id !== paymentMethod.id
	);

	if ( ! isFetching && ! nextPrimaryPaymentMethod ) {
		return (
			<div className="payment-method-delete-primary-confirmation">
				<div className="payment-method-delete-primary-confirmation__card">
					<p className="payment-method-delete-primary-confirmation__notice">
						{ translate(
							'Issuing new licenses will be paused until you add a new primary payment method. ' +
								'Additionally, the existing licenses will be revoked at the end of their respective terms.'
						) }
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="payment-method-delete-primary-confirmation">
			<div className="payment-method-delete-primary-confirmation__card">
				<div className="payment-method-delete-primary-confirmation__card-title">
					{ translate( 'Deleting' ) }
				</div>
				<div className="payment-method-delete-primary-confirmation__card-details">
					<div className="payment-method-delete-primary-confirmation__card-details-logo">
						<PaymentLogo brand={ paymentMethod?.card.brand } isSummary />
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
								<PaymentLogo brand={ nextPrimaryPaymentMethod?.card.brand } isSummary />
							</div>
							<div>**** **** **** { nextPrimaryPaymentMethod?.card.last4 }</div>
							<div>{ `${ nextPrimaryPaymentMethod?.card.exp_month }/${ nextPrimaryPaymentMethod?.card.exp_year }` }</div>
						</>
					) }
				</div>

				<p className="payment-method-delete-primary-confirmation__notice">
					<small>
						{ translate( 'Your primary payment method will be charged automatically each month.' ) }
					</small>
				</p>
			</div>
		</div>
	);
};

export default PaymentMethodDeletePrimaryConfirmation;
