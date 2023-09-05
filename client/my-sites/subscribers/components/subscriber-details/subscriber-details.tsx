import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import TimeSince from 'calypso/components/time-since';
import useSubscriberNewsletterCategories from 'calypso/data/newsletter-categories/use-subscriber-newsletter-categories-query';
import { useSubscriptionPlans } from '../../hooks';
import { Subscriber } from '../../types';
import { SubscriberProfile } from '../subscriber-profile';
import { SubscriberStats } from '../subscriber-stats';

import './styles.scss';

type SubscriberDetailsProps = {
	subscriber: Subscriber;
	siteId: number;
	subscriptionId?: number;
	userId?: number;
};

const SubscriberDetails = ( {
	subscriber,
	siteId,
	subscriptionId,
	userId,
}: SubscriberDetailsProps ) => {
	const translate = useTranslate();
	const subscriptionPlans = useSubscriptionPlans( subscriber );
	const newsletterCategories = useSubscriberNewsletterCategories( {
		siteId,
		subscriptionId: subscriptionId || subscriber.subscription_id,
	} );
	const newsletterCategoryNames = useMemo(
		() => newsletterCategories.data?.newsletterCategories.map( ( category ) => category.name ),
		[ newsletterCategories.data?.newsletterCategories ]
	);
	const { avatar, date_subscribed, display_name, email_address, country, url } = subscriber;

	const notApplicableLabel = translate( 'N/A', {
		context: 'For free subscriptions the plan description is displayed as N/A (not applicable)',
	} );

	return (
		<div className="subscriber-details">
			<div className="subscriber-details__header">
				<SubscriberProfile
					avatar={ avatar }
					displayName={ display_name }
					email={ email_address }
					compact={ false }
				/>
			</div>
			{ config.isEnabled( 'individual-subscriber-stats' ) && (
				<SubscriberStats siteId={ siteId } subscriptionId={ subscriptionId } userId={ userId } />
			) }
			<div className="subscriber-details__content">
				<h3 className="subscriber-details__content-title">
					{ translate( 'Newsletter subscription details' ) }
				</h3>
				<div className="subscriber-details__content-body">
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">
							{ translate( 'Subscription date' ) }
						</div>
						<TimeSince
							className="subscriber-details__content-value"
							date={ date_subscribed }
							dateFormat="LL"
						/>
					</div>
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">
							{ translate( 'Receives emails for' ) }
						</div>
						<div className="subscriber-details__content-value">
							{ newsletterCategoryNames
								? newsletterCategoryNames.join( ', ' )
								: translate( 'Not subscribed to any newsletter categories' ) }
						</div>
					</div>
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">{ translate( 'Plan' ) }</div>
						{ subscriptionPlans &&
							subscriptionPlans.map( ( subscriptionPlan, index ) => (
								<div className="subscriber-details__content-value" key={ index }>
									{ subscriptionPlan.title ? `${ subscriptionPlan.title } - ` : '' }
									{ subscriptionPlan.plan }
								</div>
							) ) }
					</div>
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">{ translate( 'Paid upgrade' ) }</div>
						{ subscriptionPlans &&
							subscriptionPlans.map( ( subscriptionPlan, index ) =>
								subscriptionPlan.startDate ? (
									<TimeSince
										className="subscriber-details__content-value"
										date={ subscriptionPlan.startDate }
										dateFormat="LL"
										key={ index }
									/>
								) : (
									<div className="subscriber-details__content-value" key={ index }>
										{ notApplicableLabel }
									</div>
								)
							) }
					</div>
				</div>
			</div>
			<div className="subscriber-details__content">
				<h3 className="subscriber-details__content-title">
					{ translate( 'Subscriber information' ) }
				</h3>
				<div className="subscriber-details__content-body">
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">{ translate( 'Email' ) }</div>
						<div className="subscriber-details__content-value">{ email_address }</div>
					</div>
					{ country && (
						<div className="subscriber-details__content-column">
							<div className="subscriber-details__content-label">{ translate( 'Country' ) }</div>
							<div className="subscriber-details__content-value">{ country.name }</div>
						</div>
					) }
					{ url && (
						<div className="subscriber-details__content-column">
							<div className="subscriber-details__content-label">
								{ translate( 'Acquisition source' ) }
							</div>
							<div className="subscriber-details__content-value">{ url }</div>
						</div>
					) }
				</div>
			</div>
		</div>
	);
};

export default SubscriberDetails;
