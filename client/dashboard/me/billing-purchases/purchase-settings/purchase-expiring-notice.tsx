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
	getRenewalUrlFromPurchase,
	isInExpirationGracePeriod,
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
		isInExpirationGracePeriod( currentPurchase )
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
	isDomainWithoutSite,
}: {
	purchase: Purchase;
	purchaseAttachedTo: Purchase | undefined;
	isDomainWithoutSite: boolean;
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
			<ExpiringText purchase={ currentPurchase } isDomainWithoutSite={ isDomainWithoutSite } />
		</Notice>
	);
}

function ExpiringText( {
	purchase,
	isDomainWithoutSite,
}: {
	purchase: Purchase;
	isDomainWithoutSite: boolean;
} ) {
	if (
		purchase.site_slug &&
		purchase.expiry_status === 'manual-renew' &&
		purchase.bill_period_days !== SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD
	) {
		return <ExpiringLaterText purchase={ purchase } isDomainWithoutSite={ isDomainWithoutSite } />;
	}

	const purchaseName = purchase.is_domain ? purchase.meta ?? '' : purchase.product_name;

	if ( purchase.bill_period_days === SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD ) {
		const daysToExpiry = differenceInCalendarDays( new Date( purchase.expiry_date ), new Date() );

		if ( purchase.is_attached_to_holding_site ) {
			return sprintf(
				// translators: %(purchaseName)s: the name of the plan, %(daysToExpiry)d: a number of days
				__( '%(purchaseName)s will expire and be removed in %(daysToExpiry)d days.' ),
				{
					purchaseName,
					daysToExpiry,
				}
			);
		}

		const message = isDomainWithoutSite
			? // translators: %(purchaseName)s: the name of the domain, %(daysToExpiry)d: a number of days
			  __(
					'%(purchaseName)s will expire and be removed from your account in %(daysToExpiry)d days.'
			  )
			: // translators: %(purchaseName)s: the name of the plan, %(daysToExpiry)d: a number of days
			  __(
					'%(purchaseName)s will expire and be removed from your site in %(daysToExpiry)d days.'
			  );
		return sprintf( message, {
			purchaseName,
			daysToExpiry,
		} );
	}

	if ( purchase.is_attached_to_holding_site ) {
		// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		return sprintf( __( '%(purchaseName)s will expire and be removed %(expiry)s.' ), {
			purchaseName,
			expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
		} );
	}

	const message = isDomainWithoutSite
		? // translators: purchaseName is the name of the domain and expiry is a formatted string like "in 3 months".
		  __( '%(purchaseName)s will expire and be removed from your account %(expiry)s.' )
		: // translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		  __( '%(purchaseName)s will expire and be removed from your site %(expiry)s.' );
	return sprintf( message, {
		purchaseName,
		expiry: getRelativeTimeString( new Date( purchase.expiry_date ) ),
	} );
}

export function ExpiringLaterText( {
	purchase,
	autoRenewingUpgradesAction,
	isDomainWithoutSite = false,
}: {
	purchase: Purchase;
	autoRenewingUpgradesAction?: () => void;
	isDomainWithoutSite?: boolean;
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
							'%(purchaseName)s will expire and be removed from your site %(expiry)s – please enable auto-renewal so you don’t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry }
					),
					{
						link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
					}
				);
			}

			const message = isDomainWithoutSite
				? // translators: purchaseName is the name of the domain and expiry is a formatted string like "in 3 months".
				  __(
						'%(purchaseName)s will expire and be removed from your account %(expiry)s. Please enable auto-renewal so you don‘t lose out on your paid features!'
				  )
				: // translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
				  __(
						'%(purchaseName)s will expire and be removed from your site %(expiry)s. Please enable auto-renewal so you don‘t lose out on your paid features!'
				  );
			return sprintf( message, { purchaseName, expiry } );
		}

		if ( autoRenewingUpgradesAction ) {
			return createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
					__(
						'%(purchaseName)s will expire and be removed from your site %(expiry)s – please renew before expiry so you don’t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
					),
					{ purchaseName, expiry }
				),
				{
					link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
				}
			);
		}

		const message = isDomainWithoutSite
			? // translators: purchaseName is the name of the domain and expiry is a formatted string like "in 3 months".
			  __(
					'%(purchaseName)s will expire and be removed from your account %(expiry)s. Please renew before expiry so you don‘t lose out on your paid features!'
			  )
			: // translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
			  __(
					'%(purchaseName)s will expire and be removed from your site %(expiry)s. Please renew before expiry so you don‘t lose out on your paid features!'
			  );
		return sprintf( message, { purchaseName, expiry } );
	}

	if ( autoRenewingUpgradesAction ) {
		return createInterpolateElement(
			sprintf(
				// translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
				__(
					'%(purchaseName)s will expire and be removed from your site %(expiry)s – update your payment information so you don’t lose out on your paid features! You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
				),
				{ purchaseName, expiry }
			),
			{
				link: <Button variant="link" onClick={ autoRenewingUpgradesAction } />,
			}
		);
	}

	const message = isDomainWithoutSite
		? // translators: purchaseName is the name of the domain and expiry is a formatted string like "in 3 months".
		  __(
				'%(purchaseName)s will expire and be removed from your account %(expiry)s. Update your payment information so you don‘t lose out on your paid features!'
		  )
		: // translators: purchaseName is the name of the plan and expiry is a formatted string like "in 3 months".
		  __(
				'%(purchaseName)s will expire and be removed from your site %(expiry)s. Update your payment information so you don‘t lose out on your paid features!'
		  );
	return sprintf( message, { purchaseName, expiry } );
}
