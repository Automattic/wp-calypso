import { PaymentLogo } from '@automattic/wpcom-checkout';
import { useTranslate } from 'i18n-calypso';
import { isClientView } from '../../../lib/is-client-view';
import type { PaymentMethodCard } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

interface Props {
	card: PaymentMethodCard;
	altCard?: PaymentMethodCard;
	isFetching: boolean;
}

const DeletePrimaryCardConfirmation = ( { card, altCard, isFetching }: Props ) => {
	const translate = useTranslate();

	const isClient = isClientView();

	if ( isFetching ) {
		return (
			<div className="delete-primary-card-confirmation">
				<div className="delete-primary-card-confirmation__card-details-loader" />
			</div>
		);
	}

	if ( ! altCard ) {
		return (
			<div className="delete-primary-card-confirmation">
				<div className="delete-primary-card-confirmation__card">
					<p className="delete-primary-card-confirmation__notice">
						{ isClient
							? translate(
									'Any items that you bought will be canceled and stop working at the end of their terms.'
							  )
							: translate(
									'Issuing new licenses will be paused until you add a new primary payment method. Additionally, the existing licenses will be revoked at the end of their respective terms.'
							  ) }
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="delete-primary-card-confirmation">
			<div className="delete-primary-card-confirmation__card">
				<div className="delete-primary-card-confirmation__card-title">
					{ translate( 'Deleting' ) }
				</div>
				<div className="delete-primary-card-confirmation__card-details">
					<div className="delete-primary-card-confirmation__card-details-logo">
						<PaymentLogo brand={ card.brand } isSummary />
					</div>
					<div>**** **** **** { card.last4 }</div>
					<div>{ `${ card.exp_month }/${ card.exp_year }` }</div>
				</div>
			</div>

			<hr className="delete-primary-card-confirmation__separator" />

			<div className="delete-primary-card-confirmation__card">
				<div className="delete-primary-card-confirmation__card-title">
					{ translate( 'Your primary payment method will automatically switch to' ) }
				</div>

				<div className="delete-primary-card-confirmation__card-details">
					<div className="delete-primary-card-confirmation__card-details-logo">
						<PaymentLogo brand={ altCard.brand } isSummary />
					</div>
					<div>**** **** **** { altCard.last4 }</div>
					<div>{ `${ altCard.exp_month }/${ altCard.exp_year }` }</div>
				</div>

				<p className="delete-primary-card-confirmation__notice">
					<small>
						{ translate( 'Your primary payment method will be charged automatically each month.' ) }
					</small>
				</p>
			</div>
		</div>
	);
};

export default DeletePrimaryCardConfirmation;
