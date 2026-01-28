import { SubscriptionBillPeriod } from '@automattic/api-core';
import { Link, useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { purchaseSettingsRoute, changePaymentMethodRoute } from '../../../app/router/me';
import Notice from '../../../components/notice';
import { getRelativeTimeString, isWithinNext } from '../../../utils/datetime';
import {
	isExpired,
	isExpiring,
	isRenewing,
	isIncludedWithPlan,
	needsToRenewSoon,
	isRecentMonthlyPurchase,
	creditCardExpiresBeforeSubscription,
	creditCardHasAlreadyExpired,
	getRenewUrlForPurchases,
	isInExpirationGracePeriod,
} from '../../../utils/purchase';
import { ExpiringLaterText } from './purchase-expiring-notice';
import { shouldShowCardExpiringWarning } from './purchase-notice';
import { UpcomingRenewalsDialog } from './upcoming-renewals-dialog';
import type { NoticeVariant } from '../../../components/notice/types';
import type { Purchase } from '@automattic/api-core';

export function shouldShowOtherRenewablePurchasesNotice(
	purchase: Purchase,
	purchaseAttachedTo: Purchase | undefined,
	renewableSitePurchases: Purchase[]
): boolean {
	if ( ! purchase.site_slug ) {
		return false;
	}
	if ( isExpired( purchase ) ) {
		return false;
	}

	// For purchases included with a plan, use the plan purchase instead
	const purchaseIsIncludedInPlan = Boolean(
		isIncludedWithPlan( purchase ) && purchaseAttachedTo?.is_plan
	);
	const currentPurchase =
		purchaseIsIncludedInPlan && purchaseAttachedTo ? purchaseAttachedTo : purchase;

	// Get other renewable purchases for this site
	const otherRenewableSitePurchases = renewableSitePurchases.filter(
		( otherPurchase ) => otherPurchase.ID !== currentPurchase.ID
	);

	if ( otherRenewableSitePurchases.length === 0 ) {
		return false;
	}

	// Calculate purchase states once
	const currentPurchaseIsExpiring =
		isExpiring( currentPurchase ) ||
		isExpired( currentPurchase ) ||
		isInExpirationGracePeriod( currentPurchase );
	const anotherPurchaseIsExpiring = otherRenewableSitePurchases.some(
		( otherPurchase ) =>
			isExpiring( otherPurchase ) ||
			isExpired( otherPurchase ) ||
			isInExpirationGracePeriod( otherPurchase )
	);

	// Special case: centennial plans with no expiring purchases don't show notices
	const isCentennialWithNoExpiring =
		purchase.bill_period_days === SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD &&
		! currentPurchaseIsExpiring &&
		! anotherPurchaseIsExpiring;

	if ( isCentennialWithNoExpiring ) {
		return false;
	}

	// Special case: credit card expiring scenarios need additional checks
	const needsCreditCardCheck = ! currentPurchaseIsExpiring && ! anotherPurchaseIsExpiring;

	if ( needsCreditCardCheck ) {
		const currentPurchaseCreditCardExpiresBeforeSubscription =
			isRenewing( currentPurchase ) && creditCardExpiresBeforeSubscription( currentPurchase );

		// Don't show if credit card expires but no payment card ID
		if ( currentPurchaseCreditCardExpiresBeforeSubscription && ! currentPurchase.payment_card_id ) {
			return false;
		}
	}

	// Show notice in all other cases
	return true;
}

function NoticeContent( {
	purchase,
	renewableSitePurchases,
	isUpcomingRenewalsDialogVisible,
	setUpcomingRenewalsDialogVisible,
	noticeStatus,
	noticeText,
	noticeActionHref,
	noticeActionOnClick,
	noticeActionText,
}: {
	purchase: Purchase;
	renewableSitePurchases: Purchase[];
	isUpcomingRenewalsDialogVisible: boolean;
	setUpcomingRenewalsDialogVisible: ( visible: boolean ) => void;
	noticeStatus: NoticeVariant;
	noticeText: React.ReactNode;
	noticeActionHref?: string;
	noticeActionOnClick?: () => void;
	noticeActionText?: string;
} ) {
	return (
		<>
			{ isUpcomingRenewalsDialogVisible && (
				<UpcomingRenewalsDialog
					onClose={ () => setUpcomingRenewalsDialogVisible( false ) }
					onConfirm={ ( purchases ) => {
						if ( purchases.length < 1 ) {
							setUpcomingRenewalsDialogVisible( false );
							return;
						}
						window.location.href = getRenewUrlForPurchases( purchases );
					} }
					siteDomain={ purchase.meta ?? purchase.domain }
					purchases={ renewableSitePurchases }
				/>
			) }
			<Notice
				variant={ noticeStatus }
				actions={
					( noticeActionHref || noticeActionOnClick ) && (
						<Button
							variant="primary"
							href={ noticeActionHref ?? undefined }
							onClick={ noticeActionOnClick ?? undefined }
						>
							{ noticeActionText }
						</Button>
					)
				}
			>
				{ noticeText }
			</Notice>
		</>
	);
}

export function OtherRenewablePurchasesNotice( {
	purchase,
	purchaseAttachedTo,
	renewableSitePurchases,
}: {
	purchase: Purchase;
	purchaseAttachedTo: Purchase | undefined;
	renewableSitePurchases: Purchase[];
} ) {
	const router = useRouter();
	const [ isUpcomingRenewalsDialogVisible, setUpcomingRenewalsDialogVisible ] =
		useState< boolean >( false );

	if ( ! purchase.site_slug ) {
		return null;
	}

	// For purchases included with a plan (for example, a domain mapping
	// bundled with the plan), the plan purchase should be used here, since
	// that is the one that can be directly renewed.
	const purchaseIsIncludedInPlan = Boolean(
		isIncludedWithPlan( purchase ) && purchaseAttachedTo?.is_plan
	);
	const currentPurchase =
		purchaseIsIncludedInPlan && purchaseAttachedTo ? purchaseAttachedTo : purchase;
	const includedPurchase = purchase;

	// Show only if there is at least one other purchase to notify about.
	const otherRenewableSitePurchases = renewableSitePurchases.filter(
		( otherPurchase ) => otherPurchase.ID !== currentPurchase.ID
	);
	if ( otherRenewableSitePurchases.length === 0 ) {
		return null;
	}

	// Main logic branches for determining which message to display.
	const currentPurchaseNeedsToRenewSoon = needsToRenewSoon( currentPurchase );
	const currentPurchaseCreditCardExpiresBeforeSubscription =
		isRenewing( currentPurchase ) && creditCardExpiresBeforeSubscription( currentPurchase );
	const currentPurchaseIsExpiring =
		isExpiring( currentPurchase ) ||
		isExpired( currentPurchase ) ||
		isInExpirationGracePeriod( currentPurchase );
	const anotherPurchaseIsExpiring = otherRenewableSitePurchases.some(
		( otherPurchase ) =>
			isExpiring( otherPurchase ) ||
			isExpired( otherPurchase ) ||
			isInExpirationGracePeriod( otherPurchase )
	);

	// Other information needed by some of the messages.
	const suppressErrorStylingForCurrentPurchase =
		isRecentMonthlyPurchase( currentPurchase ) && ! isExpired( currentPurchase );
	const suppressErrorStylingForOtherPurchases = otherRenewableSitePurchases.every(
		( otherPurchase ) => isRecentMonthlyPurchase( otherPurchase ) && ! isExpired( otherPurchase )
	);
	const anotherPurchaseIsCloseToExpiration = otherRenewableSitePurchases.some( ( otherPurchase ) =>
		isWithinNext(
			new Date( otherPurchase.expiry_date ),
			SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD,
			'days'
		)
	);
	const anotherPurchaseIsExpired = otherRenewableSitePurchases.some(
		( otherPurchase ) => isExpired( otherPurchase ) || isInExpirationGracePeriod( otherPurchase )
	);
	const expiringPurchases = otherRenewableSitePurchases
		.filter(
			( otherPurchase ) =>
				isExpiring( otherPurchase ) ||
				isExpired( otherPurchase ) ||
				isInExpirationGracePeriod( otherPurchase )
		)
		.sort( ( a, b ) => new Date( a.expiry_date ).getTime() - new Date( b.expiry_date ).getTime() );
	const earliestOtherExpiringPurchase: Purchase | undefined =
		expiringPurchases.length > 0 ? expiringPurchases[ 0 ] : undefined;

	const purchaseName = currentPurchase.is_domain
		? currentPurchase.meta ?? ''
		: currentPurchase.product_name;
	const expiry = getRelativeTimeString( new Date( currentPurchase.expiry_date ) );
	const includedPurchaseName = includedPurchase.is_domain
		? includedPurchase.meta ?? ''
		: includedPurchase.product_name;
	const earliestOtherExpiry = earliestOtherExpiringPurchase
		? getRelativeTimeString( new Date( earliestOtherExpiringPurchase.expiry_date ) )
		: '';
	const openUpcomingRenewalsDialog = () => setUpcomingRenewalsDialogVisible( true );
	const link = <Button variant="link" onClick={ () => openUpcomingRenewalsDialog() } />;
	const managePurchase = (
		<Link to={ purchaseSettingsRoute.fullPath } params={ { purchaseId: purchase.ID } } />
	);

	// Scenario 1: current-expires-soon-others-expire-soon
	if ( currentPurchaseNeedsToRenewSoon && currentPurchaseIsExpiring && anotherPurchaseIsExpiring ) {
		let noticeText: React.ReactNode;
		const noticeStatus =
			suppressErrorStylingForCurrentPurchase && suppressErrorStylingForOtherPurchases
				? 'info'
				: 'error';
		const noticeActionOnClick = () =>
			( window.location.href = getRenewUrlForPurchases( renewableSitePurchases ) );
		const noticeActionText = __( 'Renew all' );

		if ( isInExpirationGracePeriod( currentPurchase ) ) {
			if ( currentPurchase.is_domain_registration ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago"
						__(
							'Your %(purchaseName)s domain expired %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			} else if ( currentPurchase.is_plan ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) expired %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
							),
							{ purchaseName, expiry, includedPurchaseName }
						),
						{ link, managePurchase }
					);
				} else {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your %(purchaseName)s plan expired %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
							),
							{ purchaseName, expiry }
						),
						{ link }
					);
				}
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s subscription expired %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			}
		} else if ( anotherPurchaseIsCloseToExpiration ) {
			if ( currentPurchase.is_domain_registration ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s domain will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			} else if ( currentPurchase.is_plan ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
							),
							{ purchaseName, expiry, includedPurchaseName }
						),
						{ link, managePurchase }
					);
				} else {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your %(purchaseName)s plan will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
							),
							{ purchaseName, expiry }
						),
						{ link }
					);
				}
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s subscription will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed soon unless you take action.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			}
		} else if ( currentPurchase.is_domain_registration ) {
			noticeText = createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
					__(
						'Your %(purchaseName)s domain will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed unless you take action.'
					),
					{ purchaseName, expiry }
				),
				{ link }
			);
		} else if ( currentPurchase.is_plan ) {
			if ( purchaseIsIncludedInPlan ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed unless you take action.'
						),
						{ purchaseName, expiry, includedPurchaseName }
					),
					{ link, managePurchase }
				);
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s plan will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed unless you take action.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			}
		} else {
			noticeText = createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
					__(
						'Your %(purchaseName)s subscription will expire %(expiry)s, and you have <link>other upgrades</link> on this site that will also be removed unless you take action.'
					),
					{ purchaseName, expiry }
				),
				{ link }
			);
		}

		return (
			<NoticeContent
				purchase={ purchase }
				renewableSitePurchases={ renewableSitePurchases }
				isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
				setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
				noticeStatus={ noticeStatus }
				noticeText={ noticeText }
				noticeActionOnClick={ noticeActionOnClick }
				noticeActionText={ noticeActionText }
			/>
		);
	}

	// Scenario 2: current-expires-soon-others-renew-soon
	if (
		currentPurchaseNeedsToRenewSoon &&
		currentPurchaseIsExpiring &&
		! anotherPurchaseIsExpiring
	) {
		let noticeText: React.ReactNode;
		const noticeStatus = suppressErrorStylingForCurrentPurchase ? 'info' : 'error';

		if ( isInExpirationGracePeriod( currentPurchase ) ) {
			if ( currentPurchase.is_domain_registration ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s domain expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			} else if ( currentPurchase.is_plan ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
							),
							{ purchaseName, expiry, includedPurchaseName }
						),
						{ link, managePurchase }
					);
				} else {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your %(purchaseName)s plan expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
							),
							{ purchaseName, expiry }
						),
						{ link }
					);
				}
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s subscription expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			}
		} else if ( currentPurchase.is_domain_registration ) {
			noticeText = createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
					__(
						'Your %(purchaseName)s domain will expire %(expiry)s unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
					),
					{ purchaseName, expiry }
				),
				{ link }
			);
		} else if ( currentPurchase.is_plan ) {
			if ( purchaseIsIncludedInPlan ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) will expire %(expiry)s unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry, includedPurchaseName }
					),
					{ link, managePurchase }
				);
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s plan will expire %(expiry)s unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			}
		} else {
			noticeText = createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the product, expiry is a string like "3 months ago", and includedPurchaseName is the name of another product
					__(
						'Your %(purchaseName)s subscription will expire %(expiry)s unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
					),
					{ purchaseName, expiry }
				),
				{ link }
			);
		}

		return (
			<NoticeContent
				purchase={ purchase }
				renewableSitePurchases={ renewableSitePurchases }
				isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
				setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
				noticeStatus={ noticeStatus }
				noticeText={ noticeText }
			/>
		);
	}

	// Scenario 3: current-renews-soon-others-expire-soon
	if (
		currentPurchaseNeedsToRenewSoon &&
		! currentPurchaseIsExpiring &&
		anotherPurchaseIsExpiring
	) {
		let noticeText: React.ReactNode;
		const noticeStatus = suppressErrorStylingForOtherPurchases ? 'info' : 'error';
		const noticeActionOnClick = () =>
			( window.location.href = getRenewUrlForPurchases( renewableSitePurchases ) );
		const noticeActionText = __( 'Renew all' );

		if ( anotherPurchaseIsExpired ) {
			if ( currentPurchase.is_domain_registration ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s domain is scheduled to renew, but you have <link>other upgrades</link> on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.'
						),
						{ purchaseName, earliestOtherExpiry }
					),
					{ link }
				);
			} else if ( currentPurchase.is_plan ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) is scheduled to renew, but you have <link>other upgrades</link> on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.'
							),
							{ purchaseName, includedPurchaseName, earliestOtherExpiry }
						),
						{ link, managePurchase }
					);
				} else {
					noticeText = createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
							__(
								'Your %(purchaseName)s plan is scheduled to renew, but you have <link>other upgrades</link> on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.'
							),
							{ purchaseName, earliestOtherExpiry }
						),
						{ link }
					);
				}
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s subscription is scheduled to renew, but you have <link>other upgrades</link> on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.'
						),
						{ purchaseName, earliestOtherExpiry }
					),
					{ link }
				);
			}
		} else if ( currentPurchase.is_domain_registration ) {
			noticeText = createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
					__(
						'Your %(purchaseName)s domain is scheduled to renew, but you have <link>other upgrades</link> on this site that will expire %(earliestOtherExpiry)s unless you take action.'
					),
					{ purchaseName, earliestOtherExpiry }
				),
				{ link }
			);
		} else if ( currentPurchase.is_plan ) {
			if ( purchaseIsIncludedInPlan ) {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) is scheduled to renew, but you have <link>other upgrades</link> on this site that will expire %(earliestOtherExpiry)s unless you take action.'
						),
						{ purchaseName, earliestOtherExpiry }
					),
					{ link, managePurchase }
				);
			} else {
				noticeText = createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'Your %(purchaseName)s plan is scheduled to renew, but you have <link>other upgrades</link> on this site that will expire %(earliestOtherExpiry)s unless you take action.'
						),
						{ purchaseName, earliestOtherExpiry }
					),
					{ link }
				);
			}
		} else {
			noticeText = createInterpolateElement(
				sprintf(
					// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
					__(
						'Your %(purchaseName)s subscription is scheduled to renew, but you have <link>other upgrades</link> on this site that will expire %(earliestOtherExpiry)s unless you take action.'
					),
					{ purchaseName, earliestOtherExpiry }
				),
				{ link }
			);
		}

		return (
			<NoticeContent
				purchase={ purchase }
				renewableSitePurchases={ renewableSitePurchases }
				isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
				setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
				noticeStatus={ noticeStatus }
				noticeText={ noticeText }
				noticeActionOnClick={ noticeActionOnClick }
				noticeActionText={ noticeActionText }
			/>
		);
	}

	// Scenario 4: current-renews-soon-others-renew-soon and current-renews-soon-others-renew-soon-cc-expiring
	if (
		currentPurchaseNeedsToRenewSoon &&
		! currentPurchaseIsExpiring &&
		! anotherPurchaseIsExpiring
	) {
		if ( ! currentPurchaseCreditCardExpiresBeforeSubscription ) {
			return (
				<NoticeContent
					purchase={ purchase }
					renewableSitePurchases={ renewableSitePurchases }
					isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
					setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
					noticeStatus="success"
					noticeText={ createInterpolateElement(
						__(
							'You have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ link }
					) }
				/>
			);
		}

		if ( currentPurchase.payment_card_id ) {
			const cardDetails = {
				cardType: purchase.payment_card_type,
				cardNumber: purchase.payment_card_id,
				cardExpiry: purchase.payment_expiry,
			};

			const translatedMessage = creditCardHasAlreadyExpired( purchase )
				? sprintf(
						// translators: cardType is a credit card brand, cardNumber is the last 4 digits of the credit card number, and cardExpiry is the card expiration date.
						__(
							'Your %(cardType)s ending in %(cardNumber)d expired %(cardExpiry)s – before the next renewal. You have <link>other upgrades</link> on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.'
						),
						cardDetails
				  )
				: sprintf(
						// translators: cardType is a credit card brand, cardNumber is the last 4 digits of the credit card number, and cardExpiry is the card expiration date.
						__(
							'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. You have <link>other upgrades</link> on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.'
						),
						cardDetails
				  );

			return (
				<NoticeContent
					purchase={ purchase }
					renewableSitePurchases={ renewableSitePurchases }
					isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
					setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
					noticeStatus={ shouldShowCardExpiringWarning( currentPurchase ) ? 'error' : 'info' }
					noticeText={ createInterpolateElement( translatedMessage, { link } ) }
					noticeActionHref={
						router.buildLocation( {
							to: changePaymentMethodRoute.fullPath,
							params: { purchaseId: purchase.ID },
						} ).href
					}
					noticeActionText={ __( 'Update all' ) }
				/>
			);
		}
	}

	// Scenario 5: current-expires-later-others-expire-soon
	if (
		! currentPurchaseNeedsToRenewSoon &&
		currentPurchaseIsExpiring &&
		anotherPurchaseIsExpiring
	) {
		const noticeStatus = suppressErrorStylingForOtherPurchases ? 'info' : 'error';
		const noticeActionOnClick = () =>
			( window.location.href = getRenewUrlForPurchases( renewableSitePurchases ) );
		const noticeActionText = __( 'Renew Now' );
		const noticeText = anotherPurchaseIsExpired
			? createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'You have <link>other upgrades</link> on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.'
						),
						{ earliestOtherExpiry }
					),
					{ link }
			  )
			: createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'You have <link>other upgrades</link> on this site that will expire %(earliestOtherExpiry)s unless you take action.'
						),
						{ earliestOtherExpiry }
					),
					{ link }
			  );

		return (
			<NoticeContent
				purchase={ purchase }
				renewableSitePurchases={ renewableSitePurchases }
				isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
				setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
				noticeStatus={ noticeStatus }
				noticeText={ noticeText }
				noticeActionOnClick={ noticeActionOnClick }
				noticeActionText={ noticeActionText }
			/>
		);
	}

	// Scenario 6: current-expires-later-others-renew-soon
	if (
		! currentPurchaseNeedsToRenewSoon &&
		currentPurchaseIsExpiring &&
		! anotherPurchaseIsExpiring
	) {
		const noticeText = ( () => {
			// Grace period: if expiry date is past, show "expired" message instead of "will expire"
			if ( isInExpirationGracePeriod( currentPurchase ) ) {
				if ( currentPurchase.is_domain_registration ) {
					return createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 days ago"
							__(
								'Your %(purchaseName)s domain expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
							),
							{ purchaseName, expiry }
						),
						{ link }
					);
				}
				if ( currentPurchase.is_plan ) {
					if ( purchaseIsIncludedInPlan ) {
						return createInterpolateElement(
							sprintf(
								// translators: purchaseName is the name of the product, expiry is a string like "3 days ago", includedPurchaseName is the name of another product
								__(
									'Your <managePurchase>%(purchaseName)s plan</managePurchase> (which includes your %(includedPurchaseName)s subscription) expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
								),
								{ purchaseName, expiry, includedPurchaseName }
							),
							{ link, managePurchase }
						);
					}
					return createInterpolateElement(
						sprintf(
							// translators: purchaseName is the name of the product, expiry is a string like "3 days ago"
							__(
								'Your %(purchaseName)s plan expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
							),
							{ purchaseName, expiry }
						),
						{ link }
					);
				}
				return createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, expiry is a string like "3 days ago"
						__(
							'Your %(purchaseName)s subscription expired %(expiry)s and will be removed soon unless you take action. You also have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ purchaseName, expiry }
					),
					{ link }
				);
			}
			if ( currentPurchase.is_plan && purchaseIsIncludedInPlan ) {
				return createInterpolateElement(
					__(
						'You have <link>other upgrades</link> on this site that are scheduled to renew soon.'
					),
					{ link }
				);
			}
			return (
				<ExpiringLaterText
					purchase={ purchase }
					autoRenewingUpgradesAction={ openUpcomingRenewalsDialog }
				/>
			);
		} )();

		return (
			<NoticeContent
				purchase={ purchase }
				renewableSitePurchases={ renewableSitePurchases }
				isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
				setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
				noticeStatus="info"
				noticeText={ noticeText }
			/>
		);
	}

	// Scenario 7: current-renews-later-others-expire-soon
	if (
		! currentPurchaseNeedsToRenewSoon &&
		! currentPurchaseIsExpiring &&
		anotherPurchaseIsExpiring
	) {
		const noticeStatus = suppressErrorStylingForOtherPurchases ? 'info' : 'error';
		const noticeActionOnClick = () =>
			( window.location.href = getRenewUrlForPurchases( renewableSitePurchases ) );
		const noticeActionText = __( 'Renew Now' );
		const noticeText = anotherPurchaseIsExpired
			? createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'You have <link>other upgrades</link> on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.'
						),
						{ earliestOtherExpiry }
					),
					{ link }
			  )
			: createInterpolateElement(
					sprintf(
						// translators: purchaseName is the name of the product, earliestOtherExpiry is a string like "3 months ago", and includedPurchaseName is the name of another product
						__(
							'You have <link>other upgrades</link> on this site that will expire %(earliestOtherExpiry)s unless you take action.'
						),
						{ earliestOtherExpiry }
					),
					{ link }
			  );

		return (
			<NoticeContent
				purchase={ purchase }
				renewableSitePurchases={ renewableSitePurchases }
				isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
				setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
				noticeStatus={ noticeStatus }
				noticeText={ noticeText }
				noticeActionOnClick={ noticeActionOnClick }
				noticeActionText={ noticeActionText }
			/>
		);
	}

	// Scenario 8: current-renews-later-others-renew-soon and current-renews-later-others-renew-soon-cc-expiring
	if (
		! currentPurchaseNeedsToRenewSoon &&
		! currentPurchaseIsExpiring &&
		! anotherPurchaseIsExpiring &&
		purchase.bill_period_days !== SubscriptionBillPeriod.PLAN_CENTENNIAL_PERIOD
	) {
		if ( ! currentPurchaseCreditCardExpiresBeforeSubscription ) {
			return (
				<NoticeContent
					purchase={ purchase }
					renewableSitePurchases={ renewableSitePurchases }
					isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
					setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
					noticeStatus="success"
					noticeText={ createInterpolateElement(
						__(
							'You have <link>other upgrades</link> on this site that are scheduled to renew soon.'
						),
						{ link }
					) }
				/>
			);
		}

		if ( currentPurchase.payment_card_id ) {
			const cardDetails = {
				cardType: purchase.payment_card_type,
				cardNumber: purchase.payment_card_id,
				cardExpiry: purchase.payment_expiry,
			};

			const translatedMessage = creditCardHasAlreadyExpired( purchase )
				? sprintf(
						// translators: cardType is a credit card brand, cardNumber is the last 4 digits of the credit card number, and cardExpiry is the card expiration date.
						__(
							'Your %(cardType)s ending in %(cardNumber)d expired %(cardExpiry)s – before the next renewal. You have <link>other upgrades</link> on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.'
						),
						cardDetails
				  )
				: sprintf(
						// translators: cardType is a credit card brand, cardNumber is the last 4 digits of the credit card number, and cardExpiry is the card expiration date.
						__(
							'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. You have <link>other upgrades</link> on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.'
						),
						cardDetails
				  );

			return (
				<NoticeContent
					purchase={ purchase }
					renewableSitePurchases={ renewableSitePurchases }
					isUpcomingRenewalsDialogVisible={ isUpcomingRenewalsDialogVisible }
					setUpcomingRenewalsDialogVisible={ setUpcomingRenewalsDialogVisible }
					noticeStatus="info"
					noticeText={ createInterpolateElement( translatedMessage, { link } ) }
					noticeActionHref={
						router.buildLocation( {
							to: changePaymentMethodRoute.fullPath,
							params: { purchaseId: purchase.ID },
						} ).href
					}
					noticeActionText={ __( 'Update all' ) }
				/>
			);
		}
	}

	return null;
}
