import config from '@automattic/calypso-config';
import {
	getPlan,
	isDomainTransfer,
	isConciergeSession,
	isPlan,
	isDomainRegistration,
	isAkismetFreeProduct,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	is100Year,
	getPlanPath,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { isEmpty, merge, minBy } from 'lodash';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Notice, { NoticeStatus } from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	canExplicitRenew,
	creditCardExpiresBeforeSubscription,
	getName,
	isCloseToExpiration,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPartnerPurchase,
	isRecentMonthlyPurchase,
	isRenewable,
	isRenewing,
	isRechargeable,
	needsToRenewSoon,
	hasPaymentMethod,
	showCreditCardExpiringWarning,
	isPaidWithCredits,
	shouldAddPaymentSourceInsteadOfRenewingNow,
	isMonthlyPurchase,
} from 'calypso/lib/purchases';
import { getTrialCheckoutUrl } from 'calypso/lib/trials/get-trial-checkout-url';
import { managePurchase } from 'calypso/me/purchases/paths';
import UpcomingRenewalsDialog from 'calypso/me/purchases/upcoming-renewals/upcoming-renewals-dialog';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAddNewPaymentMethodPath, isTemporarySitePurchase } from '../utils';
import type { SiteDetails } from '@automattic/data-stores';
import type {
	GetManagePurchaseUrlFor,
	Purchase,
	PurchasePaymentCreditCard,
} from 'calypso/lib/purchases/types';
import type { LocalizeProps, TranslateOptions } from 'i18n-calypso';
import type { ReactNode, ReactElement } from 'react';

import './notices.scss';

const eventProperties = ( warning: string ) => ( { warning, position: 'individual-purchase' } );

export interface PurchaseNoticeProps {
	changePaymentMethodPath: string | false;
	getAddNewPaymentMethodUrlFor: ( siteSlug: string ) => string | undefined;
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	handleRenew: () => void;
	handleRenewMultiplePurchases: ( purchases: Purchase[] ) => void;
	isDataLoading: boolean;
	isProductOwner: boolean;
	purchase: Purchase;
	purchaseAttachedTo: Purchase | null | undefined;
	renewableSitePurchases: Purchase[];
	selectedSite: SiteDetails | null | undefined;
}

export interface PurchaseNoticeConnectedProps {
	recordTracksEvent: typeof recordTracksEvent;
}

interface MomentProps {
	moment: typeof moment;
}

class PurchaseNotice extends Component<
	PurchaseNoticeProps & PurchaseNoticeConnectedProps & LocalizeProps & MomentProps
> {
	static defaultProps = {
		getManagePurchaseUrlFor: managePurchase,
		getAddNewPaymentMethodUrlFor: getAddNewPaymentMethodPath,
	};

	state = {
		showUpcomingRenewalsDialog: false,
	};

	getExpiringText( purchase: Purchase ) {
		const { translate, moment, selectedSite } = this.props;
		const expiry = moment( purchase.expiryDate );

		if ( selectedSite && purchase.expiryStatus === 'manualRenew' && ! is100Year( purchase ) ) {
			return this.getExpiringLaterText( purchase );
		}

		if ( isMonthlyPurchase( purchase ) ) {
			const daysToExpiry = expiry.diff( moment(), 'days' );

			if ( isTemporarySitePurchase( purchase ) ) {
				return translate( '%(purchaseName)s will expire and be removed in %(daysToExpiry)d days.', {
					args: {
						purchaseName: getName( purchase ),
						daysToExpiry,
					},
				} );
			}

			return translate(
				'%(purchaseName)s will expire and be removed from your site in %(daysToExpiry)d days.',
				{
					args: {
						purchaseName: getName( purchase ),
						daysToExpiry,
					},
				}
			);
		}

		if ( isTemporarySitePurchase( purchase ) ) {
			return translate( '%(purchaseName)s will expire and be removed %(expiry)s.', {
				args: {
					purchaseName: getName( purchase ),
					expiry: expiry.fromNow(),
				},
			} );
		}

		return translate( '%(purchaseName)s will expire and be removed from your site %(expiry)s.', {
			args: {
				purchaseName: getName( purchase ),
				expiry: expiry.fromNow(),
			},
		} );
	}

	/**
	 * Returns appropriate warning text for a purchase that is expiring but where the expiration is not imminent.
	 * @param  {Object} purchase  The purchase object
	 * @param  {Component} autoRenewingUpgradesLink  An optional link component, for linking to other purchases on the site that are auto-renewing rather than expiring
	 * @returns  {string}  Translated text for the warning message.
	 */
	getExpiringLaterText( purchase: Purchase, autoRenewingUpgradesLink?: ReactElement ): ReactNode {
		const { translate, moment } = this.props;
		const expiry = moment( purchase.expiryDate );

		const translateOptions: TranslateOptions = {
			args: {
				purchaseName: getName( purchase ),
				expiry: expiry.fromNow(),
			},
		};

		if ( autoRenewingUpgradesLink ) {
			translateOptions.components = {
				link: autoRenewingUpgradesLink,
			};
		}

		if ( isPaidWithCredits( purchase ) ) {
			if ( autoRenewingUpgradesLink ) {
				return translate(
					"You purchased %(purchaseName)s with credits – please update your payment information before your plan expires %(expiry)s so that you don't lose out on your paid features! You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.",
					translateOptions
				);
			}

			return translate(
				"You purchased %(purchaseName)s with credits. Please update your payment information before your plan expires %(expiry)s so that you don't lose out on your paid features!",
				translateOptions
			);
		}

		if ( hasPaymentMethod( purchase ) ) {
			if ( isRechargeable( purchase ) ) {
				if ( autoRenewingUpgradesLink ) {
					return translate(
						"%(purchaseName)s will expire and be removed from your site %(expiry)s – please enable auto-renewal so you don't lose out on your paid features! You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.",
						translateOptions
					);
				}

				return translate(
					"%(purchaseName)s will expire and be removed from your site %(expiry)s. Please enable auto-renewal so you don't lose out on your paid features!",
					translateOptions
				);
			}

			if ( autoRenewingUpgradesLink ) {
				return translate(
					"%(purchaseName)s will expire and be removed from your site %(expiry)s – please renew before expiry so you don't lose out on your paid features! You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.",
					translateOptions
				);
			}

			return translate(
				"%(purchaseName)s will expire and be removed from your site %(expiry)s. Please renew before expiry so you don't lose out on your paid features!",
				translateOptions
			);
		}

		if ( autoRenewingUpgradesLink ) {
			return translate(
				"%(purchaseName)s will expire and be removed from your site %(expiry)s – update your payment information so you don't lose out on your paid features! You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.",
				translateOptions
			);
		}

		return translate(
			"%(purchaseName)s will expire and be removed from your site %(expiry)s. Update your payment information so you don't lose out on your paid features!",
			translateOptions
		);
	}

	renderRenewNoticeAction( onClick: () => void ) {
		const { changePaymentMethodPath, purchase, translate } = this.props;

		if ( ! this.props.selectedSite ) {
			return null;
		}

		if (
			! hasPaymentMethod( purchase ) &&
			( ! canExplicitRenew( purchase ) || shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) )
		) {
			return (
				<NoticeAction href={ changePaymentMethodPath ? changePaymentMethodPath : undefined }>
					{ translate( 'Add Payment Method' ) }
				</NoticeAction>
			);
		}

		// isExpiring(), which leads here (along with isExpired()) returns true
		// when expiring, when auto-renew is disabled, or when the payment method
		// was credits but we don't want to show "Add Payment Method" if the
		// subscription is actually expiring or expired; we want to show "Renew
		// Now" in that case.
		if ( isPaidWithCredits( purchase ) && purchase.expiryStatus === 'manualRenew' ) {
			return (
				<NoticeAction href={ changePaymentMethodPath ? changePaymentMethodPath : undefined }>
					{ config.isEnabled( 'purchases/new-payment-methods' )
						? translate( 'Add Payment Method' )
						: translate( 'Add Credit Card' ) }
				</NoticeAction>
			);
		}

		return (
			! isRechargeable( purchase ) && (
				<NoticeAction onClick={ onClick }>{ translate( 'Renew Now' ) }</NoticeAction>
			)
		);
	}

	trackImpression( warning: string ) {
		return (
			<TrackComponentView
				eventName="calypso_subscription_warning_impression"
				eventProperties={ eventProperties( warning ) }
			/>
		);
	}

	trackClick( warning: string ) {
		this.props.recordTracksEvent(
			'calypso_subscription_warning_click',
			eventProperties( warning )
		);
	}

	handleExpiringNoticeRenewal = () => {
		this.trackClick( 'purchase-expiring' );
		if ( this.props.handleRenew ) {
			this.props.handleRenew();
		}
	};

	handleExpiringNoticeRenewAll = () => {
		const { renewableSitePurchases } = this.props;
		this.trackClick( 'other-purchases-expiring-renew-all' );
		if ( this.props.handleRenewMultiplePurchases ) {
			this.props.handleRenewMultiplePurchases( renewableSitePurchases );
		}
	};

	handleExpiringCardNoticeUpdateAll = () => {
		this.trackClick( 'other-purchases-expiring-card-update-all' );
	};

	handleExpiringNoticeRenewSelection = ( selectedRenewableSitePurchases: Purchase[] ) => {
		const { renewableSitePurchases } = this.props;
		this.props.recordTracksEvent( 'calypso_subscription_upcoming_renewals_dialog_submit', {
			selected: selectedRenewableSitePurchases.length,
			available: renewableSitePurchases.length,
		} );
		if ( this.props.handleRenewMultiplePurchases ) {
			this.props.handleRenewMultiplePurchases( selectedRenewableSitePurchases );
		}
	};

	renderPurchaseExpiringNotice() {
		const EXCLUDED_PRODUCTS = [
			PLAN_ECOMMERCE_TRIAL_MONTHLY,
			PLAN_MIGRATION_TRIAL_MONTHLY,
			PLAN_HOSTING_TRIAL_MONTHLY,
		];
		const {
			moment,
			purchase,
			purchaseAttachedTo,
			selectedSite,
			translate,
			getManagePurchaseUrlFor,
		} = this.props;

		// For purchases included with a plan (for example, a domain mapping
		// bundled with the plan), the plan purchase is used on this page when
		// there are other upcoming renewals to display, so for consistency it
		// should also be used here (where there are no upcoming renewals to
		// display).
		const usePlanInsteadOfIncludedPurchase = Boolean(
			config.isEnabled( 'upgrades/upcoming-renewals-notices' ) &&
				isIncludedWithPlan( purchase ) &&
				purchaseAttachedTo &&
				isPlan( purchaseAttachedTo )
		);
		const currentPurchase =
			usePlanInsteadOfIncludedPurchase && purchaseAttachedTo ? purchaseAttachedTo : purchase;
		const includedPurchase = purchase;

		if (
			! isExpiring( currentPurchase ) ||
			EXCLUDED_PRODUCTS.includes( currentPurchase?.productSlug ) ||
			isAkismetFreeProduct( currentPurchase )
		) {
			return null;
		}

		if ( purchase.isHundredYearDomain ) {
			return null;
		}

		if ( is100Year( purchase ) && ! isCloseToExpiration( purchase ) ) {
			return null;
		}
		let noticeStatus: NoticeStatus = 'is-info';

		if ( isCloseToExpiration( currentPurchase ) && ! isRecentMonthlyPurchase( currentPurchase ) ) {
			noticeStatus = 'is-error';
		}

		if ( usePlanInsteadOfIncludedPurchase && ! selectedSite ) {
			return null;
		}

		if ( usePlanInsteadOfIncludedPurchase && selectedSite ) {
			const noticeText = translate(
				'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) will expire and be removed from your site %(expiry)s.',
				{
					args: {
						purchaseName: getName( currentPurchase ),
						includedPurchaseName: getName( includedPurchase ),
						expiry: moment( currentPurchase.expiryDate ).fromNow(),
					},
					components: {
						managePurchase: (
							<a href={ getManagePurchaseUrlFor( selectedSite.slug, currentPurchase.id ) } />
						),
					},
				}
			);
			// We can't show the action here, because it would try to renew the
			// included purchase (rather than the plan that it is attached to).
			// So we have to rely on the user going to the manage purchase page
			// for the plan to renew it there.
			return (
				<Notice
					className="manage-purchase__purchase-expiring-notice"
					showDismiss={ false }
					status={ noticeStatus }
					text={ noticeText }
				>
					{ this.trackImpression( 'purchase-expiring' ) }
				</Notice>
			);
		}

		const noticeText = this.getExpiringText( currentPurchase );
		return (
			<Notice
				className="manage-purchase__purchase-expiring-notice"
				showDismiss={ false }
				status={ noticeStatus }
				text={ noticeText }
			>
				{ this.renderRenewNoticeAction( this.handleExpiringNoticeRenewal ) }
				{ this.trackImpression( 'purchase-expiring' ) }
			</Notice>
		);
	}

	renderOtherRenewablePurchasesNotice() {
		const {
			translate,
			moment,
			purchase,
			purchaseAttachedTo,
			selectedSite,
			renewableSitePurchases,
			getManagePurchaseUrlFor,
			getAddNewPaymentMethodUrlFor,
		} = this.props;

		if ( ! config.isEnabled( 'upgrades/upcoming-renewals-notices' ) ) {
			return null;
		}

		if ( ! selectedSite ) {
			return null;
		}

		// For purchases included with a plan (for example, a domain mapping
		// bundled with the plan), the plan purchase should be used here, since
		// that is the one that can be directly renewed.
		const purchaseIsIncludedInPlan = Boolean(
			isIncludedWithPlan( purchase ) && purchaseAttachedTo && isPlan( purchaseAttachedTo )
		);
		const currentPurchase =
			purchaseIsIncludedInPlan && purchaseAttachedTo ? purchaseAttachedTo : purchase;
		const includedPurchase = purchase;

		// Show only if there is at least one other purchase to notify about.
		const otherRenewableSitePurchases = renewableSitePurchases.filter(
			( otherPurchase ) => otherPurchase.id !== currentPurchase.id
		);
		if ( isEmpty( otherRenewableSitePurchases ) ) {
			return null;
		}

		// Main logic branches for determining which message to display.
		const currentPurchaseNeedsToRenewSoon = needsToRenewSoon( currentPurchase );
		const currentPurchaseCreditCardExpiresBeforeSubscription =
			isRenewing( currentPurchase ) && creditCardExpiresBeforeSubscription( currentPurchase );
		const currentPurchaseIsExpiring = isExpiring( currentPurchase ) || isExpired( currentPurchase );
		const anotherPurchaseIsExpiring = otherRenewableSitePurchases.some(
			( otherPurchase ) => isExpiring( otherPurchase ) || isExpired( otherPurchase )
		);

		// Other information needed by some of the messages.
		const suppressErrorStylingForCurrentPurchase =
			isRecentMonthlyPurchase( currentPurchase ) && ! isExpired( currentPurchase );
		const suppressErrorStylingForOtherPurchases = otherRenewableSitePurchases.every(
			( otherPurchase ) => isRecentMonthlyPurchase( otherPurchase ) && ! isExpired( otherPurchase )
		);
		const anotherPurchaseIsCloseToExpiration = otherRenewableSitePurchases.some(
			( otherPurchase ) => moment( otherPurchase.expiryDate ).diff( Date.now(), 'months' ) < 1
		);
		const anotherPurchaseIsExpired = otherRenewableSitePurchases.some( isExpired );
		const earliestOtherExpiringPurchase = minBy(
			otherRenewableSitePurchases.filter(
				( otherPurchase ) => isExpiring( otherPurchase ) || isExpired( otherPurchase )
			),
			( otherPurchase ) => moment( otherPurchase.expiryDate ).format( 'X' )
		);

		const expiry = moment( currentPurchase.expiryDate );
		const translateOptions = {
			args: {
				purchaseName: getName( currentPurchase ),
				includedPurchaseName: getName( includedPurchase ),
				expiry: expiry.fromNow(),
				earliestOtherExpiry: earliestOtherExpiringPurchase
					? moment( earliestOtherExpiringPurchase.expiryDate ).fromNow()
					: '',
			},
			components: {
				link: (
					<button
						className="manage-purchase__other-upgrades-button"
						onClick={ this.openUpcomingRenewalsDialog }
					/>
				),
				managePurchase: (
					<a href={ getManagePurchaseUrlFor( selectedSite.slug, currentPurchase.id ) } />
				),
			},
		};

		let noticeStatus: NoticeStatus = 'is-info';
		let noticeIcon = null;
		let noticeActionHref = null;
		let noticeActionOnClick = null;
		let noticeActionText = '';
		let noticeImpressionName = '';
		let noticeText: ReactNode = '';

		// Scenario 1: current-expires-soon-others-expire-soon
		if (
			currentPurchaseNeedsToRenewSoon &&
			currentPurchaseIsExpiring &&
			anotherPurchaseIsExpiring
		) {
			noticeStatus =
				suppressErrorStylingForCurrentPurchase && suppressErrorStylingForOtherPurchases
					? 'is-info'
					: 'is-error';
			noticeActionOnClick = this.handleExpiringNoticeRenewAll;
			noticeActionText = translate( 'Renew all' );
			noticeImpressionName = 'current-expires-soon-others-expire-soon';

			if ( isExpired( currentPurchase ) ) {
				if ( isDomainRegistration( currentPurchase ) ) {
					noticeText = translate(
						'Your %(purchaseName)s domain expired %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
						translateOptions
					);
				} else if ( isPlan( currentPurchase ) ) {
					if ( purchaseIsIncludedInPlan ) {
						noticeText = translate(
							'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) expired %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
							translateOptions
						);
					} else {
						noticeText = translate(
							'Your %(purchaseName)s plan expired %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
							translateOptions
						);
					}
				} else {
					noticeText = translate(
						'Your %(purchaseName)s subscription expired %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
						translateOptions
					);
				}
			} else if ( anotherPurchaseIsCloseToExpiration ) {
				if ( isDomainRegistration( currentPurchase ) ) {
					noticeText = translate(
						'Your %(purchaseName)s domain will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
						translateOptions
					);
				} else if ( isPlan( currentPurchase ) ) {
					if ( purchaseIsIncludedInPlan ) {
						noticeText = translate(
							'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
							translateOptions
						);
					} else {
						noticeText = translate(
							'Your %(purchaseName)s plan will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
							translateOptions
						);
					}
				} else {
					noticeText = translate(
						'Your %(purchaseName)s subscription will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed soon unless you take action.',
						translateOptions
					);
				}
			} else if ( isDomainRegistration( currentPurchase ) ) {
				noticeText = translate(
					'Your %(purchaseName)s domain will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed unless you take action.',
					translateOptions
				);
			} else if ( isPlan( currentPurchase ) ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = translate(
						'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed unless you take action.',
						translateOptions
					);
				} else {
					noticeText = translate(
						'Your %(purchaseName)s plan will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed unless you take action.',
						translateOptions
					);
				}
			} else {
				noticeText = translate(
					'Your %(purchaseName)s subscription will expire %(expiry)s, and you have {{link}}other upgrades{{/link}} on this site that will also be removed unless you take action.',
					translateOptions
				);
			}
		}

		// Scenario 2: current-expires-soon-others-renew-soon
		if (
			currentPurchaseNeedsToRenewSoon &&
			currentPurchaseIsExpiring &&
			! anotherPurchaseIsExpiring
		) {
			noticeStatus = suppressErrorStylingForCurrentPurchase ? 'is-info' : 'is-error';
			noticeImpressionName = 'current-expires-soon-others-renew-soon';

			if ( isExpired( currentPurchase ) ) {
				if ( isDomainRegistration( currentPurchase ) ) {
					noticeText = translate(
						'Your %(purchaseName)s domain expired %(expiry)s and will be removed soon unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
						translateOptions
					);
				} else if ( isPlan( currentPurchase ) ) {
					if ( purchaseIsIncludedInPlan ) {
						noticeText = translate(
							'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) expired %(expiry)s and will be removed soon unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
							translateOptions
						);
					} else {
						noticeText = translate(
							'Your %(purchaseName)s plan expired %(expiry)s and will be removed soon unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
							translateOptions
						);
					}
				} else {
					noticeText = translate(
						'Your %(purchaseName)s subscription expired %(expiry)s and will be removed soon unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
						translateOptions
					);
				}
			} else if ( isDomainRegistration( currentPurchase ) ) {
				noticeText = translate(
					'Your %(purchaseName)s domain will expire %(expiry)s unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
					translateOptions
				);
			} else if ( isPlan( currentPurchase ) ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = translate(
						'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) will expire %(expiry)s unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
						translateOptions
					);
				} else {
					noticeText = translate(
						'Your %(purchaseName)s plan will expire %(expiry)s unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
						translateOptions
					);
				}
			} else {
				noticeText = translate(
					'Your %(purchaseName)s subscription will expire %(expiry)s unless you take action. You also have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
					translateOptions
				);
			}
		}

		// Scenario 3: current-renews-soon-others-expire-soon
		if (
			currentPurchaseNeedsToRenewSoon &&
			! currentPurchaseIsExpiring &&
			anotherPurchaseIsExpiring
		) {
			noticeStatus = suppressErrorStylingForOtherPurchases ? 'is-info' : 'is-error';
			noticeActionOnClick = this.handleExpiringNoticeRenewAll;
			noticeActionText = translate( 'Renew all' );
			noticeImpressionName = 'current-renews-soon-others-expire-soon';

			if ( anotherPurchaseIsExpired ) {
				if ( isDomainRegistration( currentPurchase ) ) {
					noticeText = translate(
						'Your %(purchaseName)s domain is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.',
						translateOptions
					);
				} else if ( isPlan( currentPurchase ) ) {
					if ( purchaseIsIncludedInPlan ) {
						noticeText = translate(
							'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.',
							translateOptions
						);
					} else {
						noticeText = translate(
							'Your %(purchaseName)s plan is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.',
							translateOptions
						);
					}
				} else {
					noticeText = translate(
						'Your %(purchaseName)s subscription is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.',
						translateOptions
					);
				}
			} else if ( isDomainRegistration( currentPurchase ) ) {
				noticeText = translate(
					'Your %(purchaseName)s domain is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that will expire %(earliestOtherExpiry)s unless you take action.',
					translateOptions
				);
			} else if ( isPlan( currentPurchase ) ) {
				if ( purchaseIsIncludedInPlan ) {
					noticeText = translate(
						'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that will expire %(earliestOtherExpiry)s unless you take action.',
						translateOptions
					);
				} else {
					noticeText = translate(
						'Your %(purchaseName)s plan is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that will expire %(earliestOtherExpiry)s unless you take action.',
						translateOptions
					);
				}
			} else {
				noticeText = translate(
					'Your %(purchaseName)s subscription is scheduled to renew, but you have {{link}}other upgrades{{/link}} on this site that will expire %(earliestOtherExpiry)s unless you take action.',
					translateOptions
				);
			}
		}

		// Scenario 4: current-renews-soon-others-renew-soon and current-renews-soon-others-renew-soon-cc-expiring
		if (
			currentPurchaseNeedsToRenewSoon &&
			! currentPurchaseIsExpiring &&
			! anotherPurchaseIsExpiring
		) {
			if ( ! currentPurchaseCreditCardExpiresBeforeSubscription ) {
				noticeStatus = 'is-success';
				noticeIcon = 'info';
				noticeImpressionName = 'current-renews-soon-others-renew-soon';
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
					translateOptions
				);
			} else if ( currentPurchase.payment.creditCard ) {
				noticeStatus = showCreditCardExpiringWarning( currentPurchase ) ? 'is-error' : 'is-info';
				noticeActionHref = getAddNewPaymentMethodUrlFor( selectedSite.slug );
				noticeActionOnClick = this.handleExpiringCardNoticeUpdateAll;
				noticeActionText = translate( 'Update all' );
				noticeImpressionName = 'current-renews-soon-others-renew-soon-cc-expiring';
				noticeText = translate(
					'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.',
					merge( translateOptions, {
						args: this.creditCardDetails( currentPurchase.payment.creditCard ),
					} )
				);
			}
		}

		// Scenario 5: current-expires-later-others-expire-soon
		if (
			! currentPurchaseNeedsToRenewSoon &&
			currentPurchaseIsExpiring &&
			anotherPurchaseIsExpiring
		) {
			noticeStatus = suppressErrorStylingForOtherPurchases ? 'is-info' : 'is-error';
			noticeActionOnClick = this.handleExpiringNoticeRenewAll;
			noticeActionText = translate( 'Renew Now' );
			noticeImpressionName = 'current-expires-later-others-expire-soon';

			if ( anotherPurchaseIsExpired ) {
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.',
					translateOptions
				);
			} else {
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that will expire %(earliestOtherExpiry)s unless you take action.',
					translateOptions
				);
			}
		}

		// Scenario 6: current-expires-later-others-renew-soon
		if (
			! currentPurchaseNeedsToRenewSoon &&
			currentPurchaseIsExpiring &&
			! anotherPurchaseIsExpiring
		) {
			noticeStatus = 'is-info';
			noticeImpressionName = 'current-expires-later-others-renew-soon';

			if ( isPlan( currentPurchase ) && purchaseIsIncludedInPlan ) {
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
					translateOptions
				);
			} else {
				noticeText = this.getExpiringLaterText( currentPurchase, translateOptions.components.link );
			}
		}

		// Scenario 7: current-renews-later-others-expire-soon
		if (
			! currentPurchaseNeedsToRenewSoon &&
			! currentPurchaseIsExpiring &&
			anotherPurchaseIsExpiring
		) {
			noticeStatus = suppressErrorStylingForOtherPurchases ? 'is-info' : 'is-error';
			noticeActionOnClick = this.handleExpiringNoticeRenewAll;
			noticeActionText = translate( 'Renew Now' );
			noticeImpressionName = 'current-renews-later-others-expire-soon';

			if ( anotherPurchaseIsExpired ) {
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that expired %(earliestOtherExpiry)s and will be removed soon unless you take action.',
					translateOptions
				);
			} else {
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that will expire %(earliestOtherExpiry)s unless you take action.',
					translateOptions
				);
			}
		}

		// Scenario 8: current-renews-later-others-renew-soon and current-renews-later-others-renew-soon-cc-expiring
		if (
			! currentPurchaseNeedsToRenewSoon &&
			! currentPurchaseIsExpiring &&
			! anotherPurchaseIsExpiring &&
			! is100Year( purchase )
		) {
			if ( ! currentPurchaseCreditCardExpiresBeforeSubscription ) {
				noticeStatus = 'is-success';
				noticeIcon = 'info';
				noticeImpressionName = 'current-renews-later-others-renew-soon';
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
					translateOptions
				);
			} else if ( currentPurchase.payment.creditCard ) {
				noticeStatus = 'is-info';
				noticeActionHref = getAddNewPaymentMethodUrlFor( selectedSite.slug );
				noticeActionOnClick = this.handleExpiringCardNoticeUpdateAll;
				noticeActionText = translate( 'Update all' );
				noticeImpressionName = 'current-renews-later-others-renew-soon-cc-expiring';
				noticeText = translate(
					'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.',
					merge( translateOptions, {
						args: this.creditCardDetails( currentPurchase.payment.creditCard ),
					} )
				);
			}
		}

		if ( ! noticeText ) {
			return null;
		}

		return (
			<>
				<UpcomingRenewalsDialog
					isVisible={ this.state.showUpcomingRenewalsDialog }
					purchases={ renewableSitePurchases }
					site={ selectedSite }
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					onConfirm={ this.handleExpiringNoticeRenewSelection }
					onClose={ this.closeUpcomingRenewalsDialog }
				/>
				<Notice
					className="manage-purchase__other-renewable-purchases-notice"
					showDismiss={ false }
					status={ noticeStatus }
					icon={ noticeIcon }
					text={ noticeText }
				>
					{ ( noticeActionHref || noticeActionOnClick ) && (
						<NoticeAction
							href={ noticeActionHref ?? undefined }
							onClick={ noticeActionOnClick ?? undefined }
						>
							{ noticeActionText }
						</NoticeAction>
					) }
					{ noticeImpressionName && this.trackImpression( noticeImpressionName ) }
				</Notice>
			</>
		);
	}

	openUpcomingRenewalsDialog = () => {
		this.trackClick( 'other-purchases-expiring-upcoming-renewals-dialog' );
		this.setState( { showUpcomingRenewalsDialog: true } );
	};

	closeUpcomingRenewalsDialog = () => {
		this.setState( { showUpcomingRenewalsDialog: false } );
	};

	onClickUpdateCreditCardDetails = () => {
		this.trackClick( 'credit-card-expiring' );
	};

	/**
	 * Returns an object with credit card details suitable for use as translation arguments.
	 */
	creditCardDetails = ( creditCard: PurchasePaymentCreditCard ) => {
		const { moment } = this.props;

		return {
			cardType: creditCard.type.toUpperCase(),
			cardNumber: parseInt( creditCard.number, 10 ),
			cardExpiry: moment( creditCard.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
		};
	};

	renderCreditCardExpiringNotice() {
		const { changePaymentMethodPath, purchase, translate } = this.props;

		if (
			isExpired( purchase ) ||
			isOneTimePurchase( purchase ) ||
			isIncludedWithPlan( purchase ) ||
			! this.props.selectedSite ||
			! purchase.payment.creditCard ||
			purchase.isHundredYearDomain
		) {
			return null;
		}

		if ( creditCardExpiresBeforeSubscription( purchase ) ) {
			const linkComponent = changePaymentMethodPath ? (
				<a onClick={ this.onClickUpdateCreditCardDetails } href={ changePaymentMethodPath } />
			) : (
				<span />
			);
			return (
				<Notice
					className="manage-purchase__expiring-credit-card-notice"
					showDismiss={ false }
					status={ showCreditCardExpiringWarning( purchase ) ? 'is-error' : 'is-info' }
				>
					{ translate(
						'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s ' +
							'– before the next renewal. Please {{a}}update your payment information{{/a}}.',
						{
							args: this.creditCardDetails( purchase.payment.creditCard ),
							components: {
								a: linkComponent,
							},
						}
					) }
					{ this.trackImpression( 'credit-card-expiring' ) }
				</Notice>
			);
		}
	}

	handleExpiredNoticeRenewal = () => {
		this.trackClick( 'purchase-expired' );
		if ( this.props.handleRenew ) {
			this.props.handleRenew();
		}
	};

	renderExpiredRenewNotice() {
		const { purchase, purchaseAttachedTo, selectedSite, translate, getManagePurchaseUrlFor } =
			this.props;

		// For purchases included with a plan (for example, a domain mapping
		// bundled with the plan), the plan purchase is used on this page when
		// there are other upcoming renewals to display, so for consistency it
		// should also be used here (where there are no upcoming renewals to
		// display).
		const usePlanInsteadOfIncludedPurchase = Boolean(
			config.isEnabled( 'upgrades/upcoming-renewals-notices' ) &&
				isIncludedWithPlan( purchase ) &&
				purchaseAttachedTo &&
				isPlan( purchaseAttachedTo )
		);
		const currentPurchase =
			usePlanInsteadOfIncludedPurchase && purchaseAttachedTo ? purchaseAttachedTo : purchase;
		const includedPurchase = purchase;

		if ( ! isExpired( currentPurchase ) ) {
			return null;
		}

		if ( isRenewable( purchase ) ) {
			const noticeText = translate( 'This purchase has expired and is no longer in use.' );
			return (
				<Notice showDismiss={ false } status="is-error" text={ noticeText }>
					{ this.renderRenewNoticeAction( this.handleExpiredNoticeRenewal ) }
					{ this.trackImpression( 'purchase-expired' ) }
				</Notice>
			);
		}

		if ( ! usePlanInsteadOfIncludedPurchase ) {
			return null;
		}
		if ( ! selectedSite ) {
			return null;
		}

		const noticeText = translate(
			'Your {{managePurchase}}%(purchaseName)s plan{{/managePurchase}} (which includes your %(includedPurchaseName)s subscription) has expired and is no longer in use.',
			{
				args: {
					purchaseName: getName( currentPurchase ),
					includedPurchaseName: getName( includedPurchase ),
				},
				components: {
					managePurchase: (
						<a href={ getManagePurchaseUrlFor( selectedSite.slug, currentPurchase.id ) } />
					),
				},
			}
		);
		// We can't show the action here, because it would try to renew the
		// included purchase (rather than the plan that it is attached to).
		// So we have to rely on the user going to the manage purchase page
		// for the plan to renew it there.
		return (
			<Notice showDismiss={ false } status="is-error" text={ noticeText }>
				{ this.trackImpression( 'purchase-expired' ) }
			</Notice>
		);
	}

	shouldRenderConciergeConsumedNotice() {
		const { purchase } = this.props;
		if ( ! isConciergeSession( purchase ) ) {
			return false;
		}
		if ( ! isExpired( purchase ) ) {
			return false;
		}
		return true;
	}

	renderConciergeConsumedNotice() {
		const { translate } = this.props;
		return (
			<Notice
				showDismiss={ false }
				status="is-info"
				text={ translate( 'This session has been used.' ) }
			>
				{ this.trackImpression( 'concierge-session-used' ) }
			</Notice>
		);
	}

	renderNonProductOwnerNotice() {
		const { translate } = this.props;

		return (
			<Notice
				showDismiss={ false }
				status="is-info"
				text={ translate(
					'This product was purchased by a different WordPress.com account. To manage this product, log in to that account or contact the account owner.'
				) }
			></Notice>
		);
	}

	renderInAppPurchaseNotice() {
		const { purchase, translate } = this.props;

		return (
			<Notice
				showDismiss={ false }
				status="is-info"
				text={ translate(
					'This product is an in-app purchase. You can manage it from within {{managePurchase}}the app store{{/managePurchase}}.',
					{
						components: {
							managePurchase: <a href={ purchase.iapPurchaseManagementLink ?? undefined } />,
						},
					}
				) }
			/>
		);
	}

	renderTrialNotice( productSlug: string ) {
		const { moment, purchase, selectedSite, translate } = this.props;
		const onClick = () => {
			const selectedSiteSlug = selectedSite?.slug;
			const isEcommerceTrialMonthly = productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;

			if ( isEcommerceTrialMonthly ) {
				this.props.recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
					current_plan_slug: productSlug,
					to_checkout: false,
				} );

				return page( `/plans/${ selectedSiteSlug }` );
			}

			const upgradePlanSlug = getPlan( PLAN_BUSINESS )?.getStoreSlug();

			this.props.recordTracksEvent( 'calypso_subscription_trial_notice_cta_clicked', {
				current_plan_slug: productSlug,
				to_checkout: true,
				upgrade_plan_slug: upgradePlanSlug,
			} );

			const planPath = getPlanPath( upgradePlanSlug ?? '' ) ?? '';
			const checkoutUrl = getTrialCheckoutUrl( {
				productSlug: planPath,
				siteSlug: selectedSiteSlug ?? '',
			} );

			return page( checkoutUrl );
		};

		const expiry = moment.utc( purchase.expiryDate );
		const daysToExpiry = isExpired( purchase )
			? 0
			: Math.floor( expiry.diff( moment().utc(), 'days', true ) );
		const productType =
			productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY
				? translate( 'ecommerce' )
				: getPlan( PLAN_BUSINESS )?.getTitle();
		let noticeText;
		if ( ! daysToExpiry ) {
			// translators: %productType is the type of product (e.g. ecommerce)
			noticeText = translate(
				'Your free trial has expired. Upgrade your plan to keep your %(productType)s features.',
				{
					args: {
						productType: productType as string,
					},
				}
			);
		} else {
			// translators: %expiry is the number of days remaining on the trial, %productType is the type of product (e.g. ecommerce)
			noticeText = translate(
				'You have %(expiry)s day remaining on your free trial. Upgrade your plan to keep your %(productType)s features.',
				'You have %(expiry)s days remaining on your free trial. Upgrade your plan to keep your %(productType)s features.',
				{
					count: daysToExpiry,
					args: {
						expiry: daysToExpiry,
						productType: productType as string,
					},
				}
			);
		}

		return (
			<Notice showDismiss={ false } status="is-info" text={ noticeText }>
				<NoticeAction onClick={ onClick }>{ translate( 'Upgrade Now' ) }</NoticeAction>
			</Notice>
		);
	}

	render() {
		const { purchase } = this.props;

		if ( this.props.isDataLoading ) {
			return null;
		}

		if ( isDomainTransfer( purchase ) ) {
			return null;
		}

		if (
			purchase.productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ||
			purchase.productSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
			purchase.productSlug === PLAN_HOSTING_TRIAL_MONTHLY
		) {
			return this.renderTrialNotice( purchase.productSlug );
		}

		if ( purchase.isLocked && purchase.isInAppPurchase ) {
			return this.renderInAppPurchaseNotice();
		}

		if ( ! this.props.isProductOwner ) {
			return this.renderNonProductOwnerNotice();
		}

		if ( this.shouldRenderConciergeConsumedNotice() ) {
			return this.renderConciergeConsumedNotice();
		}

		const otherRenewablePurchasesNotice = this.renderOtherRenewablePurchasesNotice();
		if ( otherRenewablePurchasesNotice ) {
			return otherRenewablePurchasesNotice;
		}

		const expiredNotice = this.renderExpiredRenewNotice();
		if ( expiredNotice ) {
			return expiredNotice;
		}

		if ( isPartnerPurchase( purchase ) ) {
			return null;
		}

		const expiringNotice = this.renderPurchaseExpiringNotice();
		if ( expiringNotice ) {
			return expiringNotice;
		}

		const expiringCreditCardNotice = this.renderCreditCardExpiringNotice();
		if ( expiringCreditCardNotice ) {
			return expiringCreditCardNotice;
		}

		return null;
	}
}

export default connect( null, { recordTracksEvent } )(
	localize( withLocalizedMoment( PurchaseNotice ) )
);
