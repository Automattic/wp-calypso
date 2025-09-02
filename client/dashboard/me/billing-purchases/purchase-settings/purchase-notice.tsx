import { DomainProductSlugs, DotcomPlans, SubscriptionBillPeriod } from '@automattic/api-core';
import { purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { differenceInCalendarDays } from 'date-fns';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import Notice from '../../../components/notice';
import { getRelativeTimeString } from '../../../utils/datetime';
import {
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isCloseToExpiration,
	isRecentMonthlyPurchase,
	isAkismetFreeProduct,
	isTemporarySitePurchase,
	getRenewalUrlFromPurchase,
} from '../../../utils/purchase';
import { getPurchaseUrl } from '../urls';
import type { Purchase } from '@automattic/api-core';

export function PurchaseNotice( { purchase }: { purchase: Purchase } ) {
	const { user } = useAuth();
	const { data: purchaseAttachedTo } = useQuery( {
		...purchaseQuery( purchase.attached_to_purchase_id ?? 0 ),
		enabled: Boolean( purchase.attached_to_purchase_id ),
	} );

	if ( purchase.async_pending_payment_block_is_set ) {
		return <AsyncPendingNotice />;
	}

	if ( purchase.product_slug === DomainProductSlugs.TRANSFER_IN ) {
		return null;
	}

	if (
		purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY ||
		purchase.product_slug === DotcomPlans.MIGRATION_TRIAL_MONTHLY ||
		purchase.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY
	) {
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

	// FIXME: add this one
	// const otherRenewablePurchasesNotice = this.renderOtherRenewablePurchasesNotice();
	// if ( otherRenewablePurchasesNotice ) {
	// 	return otherRenewablePurchasesNotice;
	// }

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

	// FIXME: finish these
	// const expiringCreditCardNotice = this.renderCreditCardExpiringNotice();
	// if ( expiringCreditCardNotice ) {
	// 	return expiringCreditCardNotice;
	// }
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
					<RenewNoticeAction
						purchase={ purchase }
						onClick={ () => {
							window.location.href = getRenewalUrlFromPurchase( purchase );
						} }
					/>
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
					managePurchase: <Link to={ getPurchaseUrl( purchase ) } />,
				}
			) }
		</Notice>
	);
}

function RenewNoticeAction( { onClick, purchase }: { purchase: Purchase; onClick: () => void } ) {
	const siteSlug = purchase.site_slug ?? purchase.blog_id;
	const changePaymentMethodPath = purchase.payment_card_id
		? `/me/purchases/${ siteSlug }/${ purchase.ID }/payment-method/change/${ purchase.payment_card_id }`
		: `/me/purchases/${ siteSlug }/${ purchase.ID }/payment-method/add`;
	const shouldAddPaymentSourceInsteadOfRenewingNow =
		isCloseToExpiration( purchase ) ||
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD;
	if (
		! purchase.payment_type &&
		( ! purchase.can_explicit_renew || shouldAddPaymentSourceInsteadOfRenewingNow )
	) {
		return <Button href={ changePaymentMethodPath }>{ __( 'Add payment method' ) }</Button>;
	}

	// isExpiring(), which leads here (along with isExpired()) returns true
	// when expiring, when auto-renew is disabled, or when the payment method
	// was credits but we don't want to show "Add Payment Method" if the
	// subscription is actually expiring or expired; we want to show "Renew
	// Now" in that case.
	if ( purchase.payment_type === 'credits' && purchase.expiry_status === 'manual-renew' ) {
		return <Button href={ changePaymentMethodPath }>{ __( 'Add payment method' ) }</Button>;
	}

	if ( ! purchase.is_rechargable ) {
		return <Button onClick={ onClick }>{ __( 'Renew now' ) }</Button>;
	}
	return null;
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
		const isEcommerceTrialMonthly = purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY;

		if ( isEcommerceTrialMonthly ) {
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
		purchase.product_slug === DotcomPlans.ECOMMERCE_TRIAL_MONTHLY
			? __( 'ecommerce' )
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
			variant="info"
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

function shouldShowExpiringNotice( purchase: Purchase, purchaseAttachedTo: Purchase | undefined ) {
	const EXCLUDED_PRODUCTS: string[] = [
		DotcomPlans.ECOMMERCE_TRIAL_MONTHLY,
		DotcomPlans.MIGRATION_TRIAL_MONTHLY,
		DotcomPlans.HOSTING_TRIAL_MONTHLY,
	];

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

	if (
		! isExpiring( currentPurchase ) ||
		EXCLUDED_PRODUCTS.includes( currentPurchase?.product_slug ) ||
		isAkismetFreeProduct( currentPurchase )
	) {
		return false;
	}

	if ( purchase.is_hundred_year_domain ) {
		return false;
	}

	if (
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD &&
		! isCloseToExpiration( purchase )
	) {
		return false;
	}

	if ( usePlanInsteadOfIncludedPurchase && ! purchase.site_slug ) {
		return false;
	}
	return true;
}

function PurchaseExpiringNotice( {
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

	if ( usePlanInsteadOfIncludedPurchase && purchase.site_slug ) {
		// We can't show the action here, because it would try to renew the
		// included purchase (rather than the plan that it is attached to).
		// So we have to rely on the user going to the manage purchase page
		// for the plan to renew it there.
		return (
			<Notice
				variant={
					isCloseToExpiration( currentPurchase ) && ! isRecentMonthlyPurchase( currentPurchase )
						? 'error'
						: 'info'
				}
			>
				{ createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the plan, includedPurchaseName is the name of the subscription included in the plan and expiry is a formatted string like "in 3 months"
						__(
							'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) will expire and be removed from your site %(expiry)s.'
						),
						{
							purchaseName: currentPurchase.is_domain
								? currentPurchase.meta ?? ''
								: currentPurchase.product_name,
							includedPurchaseName: includedPurchase.is_domain
								? includedPurchase.meta ?? ''
								: includedPurchase.product_name,
							expiry: getRelativeTimeString( new Date( currentPurchase.expiry_date ) ),
						}
					),
					{
						managePurchase: <Link to={ getPurchaseUrl( currentPurchase ) } />,
					}
				) }
			</Notice>
		);
	}

	return (
		<Notice
			variant={
				isCloseToExpiration( currentPurchase ) && ! isRecentMonthlyPurchase( currentPurchase )
					? 'error'
					: 'info'
			}
			actions={
				<RenewNoticeAction
					purchase={ purchase }
					onClick={ () => {
						window.location.href = getRenewalUrlFromPurchase( purchase );
					} }
				/>
			}
		>
			<ExpiringText purchase={ currentPurchase } />
		</Notice>
	);
}

function ExpiringText( { purchase }: { purchase: Purchase } ) {
	if (
		purchase.site_slug &&
		purchase.expiry_status === 'manual-renew' &&
		purchase.bill_period_days !== SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD
	) {
		return <ExpiringLaterText purchase={ purchase } />;
	}

	const purchaseName = purchase.is_domain ? purchase.meta ?? '' : purchase.product_name;

	if ( purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD ) {
		const daysToExpiry = differenceInCalendarDays( new Date( purchase.expiry_date ), new Date() );

		if ( isTemporarySitePurchase( purchase ) ) {
			return sprintf(
				// translators: purchaseName is the name of the plan and daysToExpiry is a number of days
				__( '%(purchaseName)s will expire and be removed in %(daysToExpiry)d days.' ),
				{
					purchaseName,
					daysToExpiry,
				}
			);
		}

		return sprintf(
			// translators: purchaseName is the name of the plan and daysToExpiry is a number of days
			__( '%(purchaseName)s will expire and be removed from your site in %(daysToExpiry)d days.' ),
			{
				purchaseName,
				daysToExpiry,
			}
		);
	}

	if ( isTemporarySitePurchase( purchase ) ) {
		// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		return sprintf( __( '%(purchaseName)s will expire and be removed %(expiry)s.' ), {
			purchaseName,
			expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		} );
	}

	return sprintf(
		// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		__( '%(purchaseName)s will expire and be removed from your site %(expiry)s.' ),
		{
			purchaseName,
			expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		}
	);
}

function ExpiringLaterText( {
	purchase,
	autoRenewingUpgradesLink,
}: {
	purchase: Purchase;
	autoRenewingUpgradesLink?: string;
} ) {
	const purchaseName = purchase.is_domain ? purchase.meta ?? '' : purchase.product_name;
	const expiry = getRelativeTimeString( new Date( purchase.expiry_date ) );

	if ( purchase.payment_type === 'credits' ) {
		if ( autoRenewingUpgradesLink ) {
			return createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
					__(
						"You purchased %(purchaseName)s with credits – please update your payment information before your plan expires %(expiry)s so that you don't lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon."
					),
					{ purchaseName, expiry }
				),
				{
					link: <a href={ autoRenewingUpgradesLink } />,
				}
			);
		}

		return sprintf(
			// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
			__(
				"You purchased %(purchaseName)s with credits. Please update your payment information before your plan expires %(expiry)s so that you don't lose out on your paid features!"
			),
			{ purchaseName, expiry }
		);
	}

	if ( purchase.payment_type ) {
		if ( purchase.is_rechargable ) {
			if ( autoRenewingUpgradesLink ) {
				return createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
						__(
							"%(purchaseName)s will expire and be removed from your site %(expiry)s – please enable auto-renewal so you don't lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon."
						),
						{ purchaseName, expiry }
					),
					{
						link: <a href={ autoRenewingUpgradesLink } />,
					}
				);
			}

			return sprintf(
				// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
				__(
					"%(purchaseName)s will expire and be removed from your site %(expiry)s. Please enable auto-renewal so you don't lose out on your paid features!"
				),
				{ purchaseName, expiry }
			);
		}

		if ( autoRenewingUpgradesLink ) {
			return createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
					__(
						"%(purchaseName)s will expire and be removed from your site %(expiry)s – please renew before expiry so you don't lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon."
					),
					{ purchaseName, expiry }
				),
				{
					link: <a href={ autoRenewingUpgradesLink } />,
				}
			);
		}

		return sprintf(
			// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
			__(
				"%(purchaseName)s will expire and be removed from your site %(expiry)s. Please renew before expiry so you don't lose out on your paid features!"
			),
			{ purchaseName, expiry }
		);
	}

	if ( autoRenewingUpgradesLink ) {
		return createInterpolateElement(
			sprintf(
				// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
				__(
					"%(purchaseName)s will expire and be removed from your site %(expiry)s – update your payment information so you don't lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon."
				),
				{ purchaseName, expiry }
			),
			{
				link: <a href={ autoRenewingUpgradesLink } />,
			}
		);
	}

	return sprintf(
		// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		__(
			"%(purchaseName)s will expire and be removed from your site %(expiry)s. Update your payment information so you don't lose out on your paid features!"
		),
		{ purchaseName, expiry }
	);
}
