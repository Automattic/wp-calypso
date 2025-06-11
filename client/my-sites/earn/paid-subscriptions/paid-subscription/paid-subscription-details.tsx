import { TimeSince } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
} from '../../memberships/constants';
import { PaidSubscription } from '../../types';

import './style.scss';

type CustomerDetailsProps = {
	paidSubscription: PaidSubscription;
};

const PaidSubscriptionDetails = ( { paidSubscription }: CustomerDetailsProps ) => {
	const translate = useTranslate();

	function getPaymentIntervalWording( interval: string ) {
		switch ( interval ) {
			case PLAN_ONE_TIME_FREQUENCY:
				return translate( ' once' );
			case PLAN_MONTHLY_FREQUENCY:
				return translate( ' monthly' );
			case PLAN_YEARLY_FREQUENCY:
				return translate( ' yearly' );
			default:
				break;
		}
	}

	return (
		<>
			<div className="paid-subscription-details__content">
				<h3 className="paid-subscription-details__content-title">{ translate( 'Details' ) }</h3>
				<div className="paid-subscription-details__content-body">
					<div className="paid-subscription-details__content-column">
						<div className="paid-subscription-details__content-label">
							{ translate( 'Offer Type' ) }
						</div>
						<div className="paid-subscription-details__content-value">
							{ paidSubscription.plan.title }
						</div>
					</div>
					<div className="paid-subscription-details__content-column">
						<div className="paid-subscription-details__content-label">
							{ translate( 'Amount' ) }
						</div>
						<div className="paid-subscription-details__content-value">
							{ formatCurrency(
								paidSubscription.plan.renewal_price,
								paidSubscription.plan.currency
							) }
							{ getPaymentIntervalWording( paidSubscription.plan.renew_interval ) }
						</div>
					</div>
					<div className="paid-subscription-details__content-column">
						<div className="paid-subscription-details__content-label">{ translate( 'Since' ) }</div>
						<TimeSince
							className="paid-subscription-details__content-value"
							date={ paidSubscription.start_date }
							dateFormat="LL"
						/>
					</div>
				</div>
			</div>
			<div className="paid-subscription-details__content">
				<h3 className="paid-subscription-details__content-title">
					{ translate( 'Supporter information' ) }
				</h3>
				<div className="paid-subscription-details__content-body">
					<div className="paid-subscription-details__content-column">
						<div className="paid-subscription-details__content-label">{ translate( 'Email' ) }</div>
						<div className="paid-subscription-details__content-value">
							{ paidSubscription.user.user_email }
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PaidSubscriptionDetails;
