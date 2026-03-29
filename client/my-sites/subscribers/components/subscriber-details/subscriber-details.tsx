import config from '@automattic/calypso-config';
import { TimeSince } from '@automattic/components';
import { Button, ExternalLink, Icon } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { NewsletterCategory } from 'calypso/data/newsletter-categories/types';
import { useSubscriptionPlans } from '../../hooks';
import { SubscriptionPlanData } from '../../hooks/use-subscription-plans';
import { Subscriber, SubscriberDetails as SubscriberDetailsType } from '../../types';
import { SubscriberProfile } from '../subscriber-profile';
import { SubscriberStats } from '../subscriber-stats';

import './styles.scss';

type SubscriberDetailsProps = {
	subscriber: SubscriberDetailsType;
	siteId: number;
	subscriptionId?: number;
	userId?: number;
	newsletterCategoriesEnabled?: boolean;
	newsletterCategories?: NewsletterCategory[];
	onClose?: () => void;
	onUnsubscribe?: ( subscriber: Subscriber ) => void;
	onGiftSubscription?: ( subscriber: Subscriber ) => void;
	onRemoveComp?: ( params: { planName: string; giftId?: number; compId?: number } ) => void;
};

const SubscriberDetails = ( {
	subscriber,
	siteId,
	subscriptionId,
	userId,
	newsletterCategoriesEnabled,
	newsletterCategories,
	onClose,
	onUnsubscribe,
	onGiftSubscription,
	onRemoveComp,
}: SubscriberDetailsProps ) => {
	const translate = useTranslate();
	const subscriptionPlans = useSubscriptionPlans( subscriber );
	const newsletterCategoryNames = useMemo(
		() =>
			newsletterCategories
				?.filter( ( category ) => !! category.subscribed )
				.map( ( category ) => category.name ),
		[ newsletterCategories ]
	);
	const { avatar, date_subscribed, display_name, email_address, country, url } = subscriber;

	const notApplicableLabel = translate( 'N/A', {
		context: 'For free subscriptions the plan description is displayed as N/A (not applicable)',
	} );

	const displayPaidUpgrade = ( subscriptionPlan: SubscriptionPlanData, index: number ) => {
		if ( subscriptionPlan.is_complimentary ) {
			return (
				<div className="subscriber-details__content-value" key={ index }>
					{ translate( 'Comp', {
						comment: 'Short for "complimentary" — a free subscription granted by the site creator',
					} ) }
					{ onRemoveComp && ( subscriptionPlan.gift_id || subscriptionPlan.comp_id ) && (
						<Button
							className="subscriber-details__remove-comp-button"
							variant="tertiary"
							aria-label={ String(
								translate( 'Remove complimentary subscription: %(planName)s', {
									args: { planName: subscriptionPlan.title ?? '' },
								} )
							) }
							onClick={ () =>
								onRemoveComp( {
									planName: subscriptionPlan.title ?? '',
									giftId: subscriptionPlan.gift_id,
									compId: subscriptionPlan.comp_id,
								} )
							}
						>
							<Icon icon={ trash } size={ 18 } />
						</Button>
					) }
				</div>
			);
		}

		if ( subscriptionPlan.startDate ) {
			return (
				<TimeSince
					className="subscriber-details__content-value"
					date={ subscriptionPlan.startDate }
					dateFormat="LL"
					key={ index }
				/>
			);
		}

		return (
			<div className="subscriber-details__content-value" key={ index }>
				{ notApplicableLabel }
			</div>
		);
	};

	return (
		<div className="subscriber-details">
			<div className="subscriber-details__header">
				<SubscriberProfile
					avatar={ avatar }
					displayName={ display_name }
					email={ email_address }
					compact={ false }
				/>
				{ onClose && (
					<Button
						onClick={ onClose }
						className="subscriber-details__close-button"
						variant="secondary"
					>
						{ translate( 'Close' ) }
					</Button>
				) }
			</div>
			{ config.isEnabled( 'individual-subscriber-stats' ) && (
				<SubscriberStats
					siteId={ siteId }
					subscriptionId={ subscriptionId }
					userId={ userId }
					dateSubscribed={ new Date( date_subscribed ) }
				/>
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
						{ date_subscribed && (
							<TimeSince
								className="subscriber-details__content-value"
								date={ date_subscribed }
								dateFormat="LL"
							/>
						) }
					</div>
					{ newsletterCategoriesEnabled && (
						<div className="subscriber-details__content-column">
							<div className="subscriber-details__content-label">
								{ translate( 'Receives emails for' ) }
							</div>
							<div className="subscriber-details__content-value">
								{ newsletterCategoryNames && newsletterCategoryNames.length > 0
									? newsletterCategoryNames.join( ', ' )
									: translate( 'Not subscribed to any newsletter categories' ) }
							</div>
						</div>
					) }
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">{ translate( 'Plan' ) }</div>
						{ subscriptionPlans &&
							subscriptionPlans.map( ( subscriptionPlan, index ) => (
								<div className="subscriber-details__content-value" key={ index }>
									{ ! subscriptionPlan.is_complimentary && subscriptionPlan.title
										? `${ subscriptionPlan.title } - `
										: '' }
									{ subscriptionPlan.plan }
								</div>
							) ) }
					</div>
					<div className="subscriber-details__content-column">
						<div className="subscriber-details__content-label">{ translate( 'Paid upgrade' ) }</div>
						{ subscriptionPlans && subscriptionPlans.map( displayPaidUpgrade ) }
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
							<div className="subscriber-details__content-label">{ translate( 'Site' ) }</div>
							<div className="subscriber-details__content-value">
								<ExternalLink href={ url }>{ url }</ExternalLink>
							</div>
						</div>
					) }
				</div>
			</div>
			{ ( onGiftSubscription || onUnsubscribe ) && (
				<div className="subscriber-details__footer">
					{ onGiftSubscription && (
						<Button
							className="subscriber-details__gift-button"
							onClick={ () => onGiftSubscription( subscriber ) }
							variant="primary"
						>
							{ translate( 'Comp a subscription' ) }
						</Button>
					) }
					{ onUnsubscribe && (
						<Button
							className="subscriber-details__delete-button"
							onClick={ () => onUnsubscribe( subscriber ) }
							variant="secondary"
							isDestructive
						>
							{ translate( 'Delete subscriber' ) }
						</Button>
					) }
				</div>
			) }
		</div>
	);
};

export default SubscriberDetails;
