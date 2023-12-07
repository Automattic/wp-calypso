import { Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { payment, chartBar } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Item } from 'calypso/components/breadcrumb';
import Gravatar from 'calypso/components/gravatar';
import NavigationHeader from 'calypso/components/navigation-header';
import TimeSince from 'calypso/components/time-since';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
} from '../../memberships/constants';
import { Subscriber } from '../../types';

import '@automattic/components/src/highlight-cards/style.scss';
import './style.scss';

type CustomerProps = {
	customer: Subscriber;
};

const Customer = ( { customer }: CustomerProps ) => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	const breadcrumbs: Item[] = [
		{
			label: translate( 'Monetize' ),
			href: `/earn/${ siteSlug }`,
		},
		{
			label: translate( 'Supporters' ),
			href: `/earn/supporters/${ siteSlug }`,
		},
		{
			label: translate( 'Details' ),
			href: '#',
		},
	];

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
		<div className="customer">
			<NavigationHeader navigationItems={ breadcrumbs } />
			<div className="customer__header">
				<Gravatar user={ customer.user } size={ 40 } className="customer__header-image" />
				<div className="customer__header-details">
					<span className="customer__header-name">{ decodeEntities( customer.user.name ) }</span>
					<span className="customer__header-email">{ customer.user.user_email }</span>
				</div>
			</div>
			<div className="customer__stats">
				<div className="customer__stats-list highlight-cards-list">
					<Card className="highlight-card customer__stats-card">
						<div className="highlight-card-icon customer__stats-card-icon">{ payment }</div>
						<div className="highlight-card-heading customer__stats-card-heading">Last 30 Days</div>
						<div className="highlight-card-count customer__stats-card-count">
							<span
								className="highlight-card-count-value customer__stats-card-value"
								title={ String( customer.plan.renewal_price ) }
							>
								{ formatCurrency( customer.plan.renewal_price, customer.plan.currency ) }
							</span>
						</div>
					</Card>
					<Card className="highlight-card customer__stats-card">
						<div className="highlight-card-icon customer__stats-card-icon">{ chartBar }</div>
						<div className="highlight-card-heading customer__stats-card-heading">Total Spent</div>
						<div className="highlight-card-count customer__stats-card-count">
							<span
								className="highlight-card-count-value customer__stats-card-value"
								title={ String( customer.all_time_total ) }
							>
								{ formatCurrency( customer.all_time_total, customer.plan.currency ) }
							</span>
						</div>
					</Card>
				</div>
			</div>
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
					{ translate( 'Subscriber information' ) }
				</h3>
				<div className="customer-details__content-body">
					<div className="customer-details__content-column">
						<div className="customer-details__content-label">{ translate( 'Email' ) }</div>
						<div className="customer-details__content-value">{ customer.user.user_email }</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Customer;
