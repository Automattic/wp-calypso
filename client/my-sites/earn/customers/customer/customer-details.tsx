import { TimeSince } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
} from '../../memberships/constants';
import { Subscriber } from '../../types';

import './style.scss';

type CustomerDetailsProps = {
	customer: Subscriber;
};

const CustomerDetails = ( { customer }: CustomerDetailsProps ) => {
	const translate = useTranslate();

	function getPaymentIntervalWording( interval: string ) {
		switch ( interval ) {
			case PLAN_ONE_TIME_FREQUENCY:
				return translate( ' once' );
				break;
			case PLAN_MONTHLY_FREQUENCY:
				return translate( ' monthly' );
				break;
			case PLAN_YEARLY_FREQUENCY:
				return translate( ' yearly' );
				break;
			default:
				break;
		}
	}

	return (
		<>
			<div className="customer-details__content">
				<h3 className="customer-details__content-title">{ translate( 'Details' ) }</h3>
				<div className="customer-details__content-body">
					<div className="customer-details__content-column">
						<div className="customer-details__content-label">{ translate( 'Offer Type' ) }</div>
						<div className="customer-details__content-value">{ customer.plan.title }</div>
					</div>
					<div className="customer-details__content-column">
						<div className="customer-details__content-label">{ translate( 'Amount' ) }</div>
						<div className="customer-details__content-value">
							{ formatCurrency( customer.plan.renewal_price, customer.plan.currency ) }
							{ getPaymentIntervalWording( customer.plan.renew_interval ) }
						</div>
					</div>
					<div className="customer-details__content-column">
						<div className="customer-details__content-label">{ translate( 'Since' ) }</div>
						<TimeSince
							className="customer-details__content-value"
							date={ customer.start_date }
							dateFormat="LL"
						/>
					</div>
				</div>
			</div>
			<div className="customer-details__content">
				<h3 className="customer-details__content-title">
					{ translate( 'Supporter information' ) }
				</h3>
				<div className="customer-details__content-body">
					<div className="customer-details__content-column">
						<div className="customer-details__content-label">{ translate( 'Email' ) }</div>
						<div className="customer-details__content-value">{ customer.user.user_email }</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default CustomerDetails;
