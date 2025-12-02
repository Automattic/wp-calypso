import { DomainProductSlugs, DotcomPlans, WooHostedPlans } from '@automattic/api-core';
import { purchaseQuery, sitePurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { differenceInCalendarDays } from 'date-fns';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { changePaymentMethodRoute, purchaseSettingsRoute } from '../../../app/router/me';
import Notice from '../../../components/notice';
import { wpcomLink } from '../../../utils/link';
import {
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isCloseToExpiration,
	isRecentMonthlyPurchase,
	needsToRenewSoon,
	creditCardExpiresBeforeSubscription,
	creditCardHasAlreadyExpired,
	getRenewalUrlFromPurchase,
} from '../../../utils/purchase';
import {
	OtherRenewablePurchasesNotice,
	shouldShowOtherRenewablePurchasesNotice,
} from './other-renewable-purchases-notice';
import { PurchaseExpiringNotice, shouldShowExpiringNotice } from './purchase-expiring-notice';
import { RenewNoticeAction, shouldShowRenewNoticeAction } from './renew-notice-action';
import type { Purchase } from '@automattic/api-core';

export function PurchaseNotice( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const { data: purchaseAttachedTo } = useQuery( {
		...purchaseQuery( purchase.attached_to_purchase_id ?? 0 ),
		enabled: Boolean( purchase.attached_to_purchase_id ),
	} );
	const { data: sitePurchases } = useQuery( {
		...sitePurchasesQuery( purchase.blog_id ?? 0 ),
	} );
	const renewableSitePurchases = sitePurchases?.filter( needsToRenewSoon );

	if ( purchase.async_pending_payment_block_is_set ) {
		return <AsyncPendingNotice />;
	}

	if ( purchase.product_slug === DomainProductSlugs.TRANSFER_IN ) {
		return null;
	}

	if ( purchase.is_trial_plan ) {
		return <TrialNotice purchase={ purchase } />;
	}

	if ( purchase.is_locked && purchase.is_iap_purchase ) {
		return <InAppPurchaseNotice purchase={ purchase } />;
	}

	if ( String( user.ID ) !== String( purchase.user_id ) ) {
		return <NonProductOwnerNotice />;
	}

	if ( purchase.product_slug === 'concierge-session' && isExpired( purchase ) ) {
		return <ConciergeConsumedNotice />;
	}

	if (
		shouldShowOtherRenewablePurchasesNotice(
			purchase,
			purchaseAttachedTo,
			renewableSitePurchases ?? []
		)
	) {
		return (
			<OtherRenewablePurchasesNotice
				purchase={ purchase }
				purchaseAttachedTo={ purchaseAttachedTo }
				renewableSitePurchases={ renewableSitePurchases ?? [] }
			/>
		);
	}

	if ( shouldShowExpiredRenewNotice( purchase, purchaseAttachedTo ) ) {
		return <ExpiredRenewNotice purchase={ purchase } purchaseAttachedTo={ purchaseAttachedTo } />;
	}

	if ( purchase.partner_type ) {
		return null;
	}

	if ( shouldShowExpiringNotice( purchase, purchaseAttachedTo ) ) {
		return (
			<PurchaseExpiringNotice purchase={ purchase } purchaseAttachedTo={ purchaseAttachedTo } />
		);
	}

	if ( shouldShowCardExpiringNotice( purchase ) ) {
		return <CreditCardExpiringNotice purchase={ purchase } />;
	}
}

function shouldShowExpiredRenewNotice(
	purchase: Purchase,
	purchaseAttachedTo: Purchase | undefined
): boolean {
	const usePlanInsteadOfIncludedPurchase = Boolean(
		isIncludedWithPlan( purchase ) && purchaseAttachedTo?.is_plan
	);
	const currentPurchase: Purchase =
		usePlanInsteadOfIncludedPurchase && purchaseAttachedTo ? purchaseAttachedTo : purchase;

	if ( ! isExpired( currentPurchase ) ) {
		return false;
	}

	if ( purchase.is_renewable ) {
		return true;
	}

	if ( ! usePlanInsteadOfIncludedPurchase ) {
		return false;
	}

	if ( ! purchase.site_slug ) {
		return false;
	}

	return true;
}

function ExpiredRenewNotice( {
	purchase,
	purchaseAttachedTo,
}: {
	purchase: Purchase;
	purchaseAttachedTo: Purchase | undefined;
} ) {
	// For purchases included with a plan (for example, a domain mapping
	// bundled with the plan), the plan purchase is used on this page when
	// there are other upcoming renewals to display, so for consistency it
	// should also be used here (where there are no upcoming renewals to
	// display).
	const usePlanInsteadOfIncludedPurchase = Boolean(
		isIncludedWithPlan( purchase ) && purchaseAttachedTo?.is_plan
	);
	const currentPurchase: Purchase =
		usePlanInsteadOfIncludedPurchase && purchaseAttachedTo ? purchaseAttachedTo : purchase;
	const includedPurchase = purchase;

	if ( purchase.is_renewable ) {
		return (
			<Notice
				variant="error"
				actions={
					shouldShowRenewNoticeAction( purchase ) ? (
						<RenewNoticeAction
							purchase={ purchase }
							onClick={ () => {
								window.location.href = getRenewalUrlFromPurchase( purchase );
							} }
						/>
					) : undefined
				}
			>
				{ __( 'This purchase has expired and is no longer in use.' ) }
			</Notice>
		);
	}

	// We can't show the action here, because it would try to renew the
	// included purchase (rather than the plan that it is attached to).
	// So we have to rely on the user going to the manage purchase page
	// for the plan to renew it there.
	return (
		<Notice variant="error">
			{ createInterpolateElement(
				sprintf(
					// translators: purchaseName ist he name of the plan, includedPurchaseName is the name of the subscription included in the plan
					__(
						'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) has expired and is no longer in use.'
					),
					{
						purchaseName: currentPurchase.is_domain
							? currentPurchase.meta ?? ''
							: currentPurchase.product_name,
						includedPurchaseName: includedPurchase.is_domain
							? includedPurchase.meta ?? ''
							: includedPurchase.product_name,
					}
				),
				{
					managePurchase: (
						<Link to={ purchaseSettingsRoute.fullPath } params={ { purchaseId: purchase.ID } } />
					),
				}
			) }
		</Notice>
	);
}

function ConciergeConsumedNotice() {
	return <Notice variant="info">{ __( 'This session has been used.' ) }</Notice>;
}

function NonProductOwnerNotice() {
	return (
		<Notice variant="info">
			{ __(
				'This product was purchased by a different WordPress.com account. To manage this product, log in to that account or contact the account owner.'
			) }
		</Notice>
	);
}

function AsyncPendingNotice() {
	return (
		<Notice variant="warning">
			{ __(
				'There is currently a payment processing for this subscription. Please wait for the payment to complete before attempting to make any changes.'
			) }
		</Notice>
	);
}

function InAppPurchaseNotice( { purchase }: { purchase: Purchase } ) {
	return (
		<Notice variant="info">
			{ createInterpolateElement(
				__(
					'This product is an in-app purchase. You can manage it from within <managePurchase/>the app store</managePurchase>.'
				),
				{
					managePurchase: <a href={ purchase.iap_purchase_management_link ?? undefined } />,
				}
			) }
		</Notice>
	);
}

function TrialNotice( { purchase }: { purchase: Purchase } ) {
	const { recordTracksEvent } = useAnalytics();
	const onClickUpgrade = () => {
		if ( purchase.product_slug === WooHostedPlans.WOO_HOSTED_FREE_TRIAL_PLAN_MONTHLY ) {
			recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
				current_plan_slug: purchase.product_slug,
				to_checkout: false,
			} );

			window.location.href = wpcomLink(
				`/setup/woo-hosted-plans?siteSlug=${ purchase.site_slug ?? '' }`
			);
			return;
		}

		if ( purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY ) {
			recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
				current_plan_slug: purchase.product_slug,
				to_checkout: false,
			} );

			window.location.href = `/plans/${ purchase.site_slug ?? '' }`;
			return;
		}

		recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
			current_plan_slug: purchase.product_slug,
			to_checkout: true,
			upgrade_plan_slug: 'business',
		} );

		const siteSlug = purchase.site_slug ?? purchase.blog_id;
		window.location.href = `/checkout/${ siteSlug }/business?redirectTo=/plans/my-plan/trial-upgraded/${ siteSlug }`;
		return;
	};

	const daysToExpiry = isExpired( purchase )
		? 0
		: differenceInCalendarDays( new Date( purchase.expiry_date ), new Date() );
	const productType =
		purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY ||
		purchase.product_slug === WooHostedPlans.WOO_HOSTED_FREE_TRIAL_PLAN_MONTHLY
			? __( 'Commerce' )
			: // translators: Business is a plan name
			  __( 'Business' );
	const noticeText = daysToExpiry
		? sprintf(
				// translators: %expiry is the number of days remaining on the trial, %productType is the type of product (e.g. ecommerce)
				_n(
					'You have %(expiry)s day remaining on your free trial. Upgrade your plan to keep your %(productType)s features.',
					'You have %(expiry)s days remaining on your free trial. Upgrade your plan to keep your %(productType)s features.',
					daysToExpiry
				),
				{
					expiry: daysToExpiry,
					productType: productType as string,
				}
		  )
		: sprintf(
				// translators: %productType is the type of product (e.g. ecommerce)
				__(
					'Your free trial has expired. Upgrade your plan to keep your %(productType)s features.'
				),
				{
					productType,
				}
		  );

	return (
		<Notice
			variant={
				isCloseToExpiration( purchase ) && ! isRecentMonthlyPurchase( purchase ) ? 'error' : 'info'
			}
			actions={
				<Button variant="primary" onClick={ onClickUpgrade }>
					{ __( 'Upgrade now' ) }
				</Button>
			}
		>
			{ noticeText }
		</Notice>
	);
}

function shouldShowCardExpiringNotice( purchase: Purchase ): boolean {
	if (
		isExpired( purchase ) ||
		isOneTimePurchase( purchase ) ||
		isIncludedWithPlan( purchase ) ||
		! purchase.site_slug ||
		! purchase.payment_card_id ||
		purchase.is_hundred_year_domain
	) {
		return false;
	}

	if ( creditCardExpiresBeforeSubscription( purchase ) ) {
		return true;
	}
	return false;
}

export function shouldShowCardExpiringWarning( purchase: Purchase ): boolean {
	return Boolean(
		! isIncludedWithPlan( purchase ) &&
			purchase.payment_card_id &&
			creditCardExpiresBeforeSubscription( purchase ) &&
			isCloseToExpiration( purchase )
	);
}

function CreditCardExpiringNotice( { purchase }: { purchase: Purchase } ) {
	const cardDetails = {
		cardType: purchase.payment_card_type,
		cardNumber: purchase.payment_card_id,
		cardExpiry: purchase.payment_expiry,
	};

	const linkComponent = {
		link: <Link to={ changePaymentMethodRoute.fullPath } params={ { purchaseId: purchase.ID } } />,
	};

	const translatedMessage = creditCardHasAlreadyExpired( purchase )
		? sprintf(
				// translators: cardType is a credit card brand, cardNumber is the last 4 digits of the credit card number, and cardExpiry is the card expiration date.
				__(
					'Your %(cardType)s ending in %(cardNumber)d expired %(cardExpiry)s – before the next renewal. Please <link>update your payment information</link>.'
				),
				cardDetails
		  )
		: sprintf(
				// translators: cardType is a credit card brand, cardNumber is the last 4 digits of the credit card number, and cardExpiry is the card expiration date.
				__(
					'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. Please <link>update your payment information</link>.'
				),
				cardDetails
		  );

	return (
		<Notice variant={ shouldShowCardExpiringWarning( purchase ) ? 'error' : 'info' }>
			{ createInterpolateElement( translatedMessage, linkComponent ) }
		</Notice>
	);
}
