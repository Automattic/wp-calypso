import { SubscriptionBillPeriod } from '@automattic/api-core';
import { Link } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { differenceInCalendarDays } from 'date-fns';
import { purchaseSettingsRoute } from '../../../app/router/me';
import Notice from '../../../components/notice';
import { getRelativeTimeString } from '../../../utils/datetime';
import {
	isIncludedWithPlan,
	isExpiring,
	isCloseToExpiration,
	isRecentMonthlyPurchase,
	isTemporarySitePurchase,
	isAkismetFreeProduct,
	getRenewalUrlFromPurchase,
} from '../../../utils/purchase';
import { RenewNoticeAction, shouldShowRenewNoticeAction } from './renew-notice-action';
import type { Purchase } from '@automattic/api-core';

export function shouldShowExpiringNotice(
	purchase: Purchase,
	purchaseAttachedTo: Purchase | undefined
) {
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
		currentPurchase?.is_trial_plan ||
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

export function PurchaseExpiringNotice( {
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
						managePurchase: (
							<Link to={ purchaseSettingsRoute.fullPath } params={ { purchaseId: purchase.ID } } />
						),
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

export function ExpiringLaterText( {
	purchase,
	autoRenewingUpgradesAction,
}: {
	purchase: Purchase;
	autoRenewingUpgradesAction?: () => void;
} ) {
	const purchaseName = purchase.is_domain ? purchase.meta ?? '' : purchase.product_name;
	const expiry = getRelativeTimeString( new Date( purchase.expiry_date ) );

	if ( purchase.payment_type === 'credits' ) {
		if ( autoRenewingUpgradesAction ) {
			return createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
					__(
						'You purchased %(purchaseName)s with credits – please update your payment information before your plan expires %(expiry)s so that you don‘t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
					),
					{ purchaseName, expiry }
				),
				{
					link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
				}
			);
		}

		return sprintf(
			// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
			__(
				'You purchased %(purchaseName)s with credits. Please update your payment information before your plan expires %(expiry)s so that you don‘t lose out on your paid features!'
			),
			{ purchaseName, expiry }
		);
	}

	if ( purchase.payment_type ) {
		if ( purchase.is_rechargeable ) {
			if ( autoRenewingUpgradesAction ) {
				return createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
						__(
							'%(purchaseName)s will expire and be removed from your site %(expiry)s – please enable auto-renewal so you don‘t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry }
					),
					{
						link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
					}
				);
			}

			return sprintf(
				// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
				__(
					'%(purchaseName)s will expire and be removed from your site %(expiry)s. Please enable auto-renewal so you don‘t lose out on your paid features!'
				),
				{ purchaseName, expiry }
			);
		}

		if ( autoRenewingUpgradesAction ) {
			return createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
					__(
						'%(purchaseName)s will expire and be removed from your site %(expiry)s – please renew before expiry so you don‘t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
					),
					{ purchaseName, expiry }
				),
				{
					link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
				}
			);
		}

		return sprintf(
			// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
			__(
				'%(purchaseName)s will expire and be removed from your site %(expiry)s. Please renew before expiry so you don‘t lose out on your paid features!'
			),
			{ purchaseName, expiry }
		);
	}

	if ( autoRenewingUpgradesAction ) {
		return createInterpolateElement(
			sprintf(
				// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
				__(
					'%(purchaseName)s will expire and be removed from your site %(expiry)s – update your payment information so you don‘t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
				),
				{ purchaseName, expiry }
			),
			{
				link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
			}
		);
	}

	return sprintf(
		// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		__(
			'%(purchaseName)s will expire and be removed from your site %(expiry)s. Update your payment information so you don‘t lose out on your paid features!'
		),
		{ purchaseName, expiry }
	);
}
