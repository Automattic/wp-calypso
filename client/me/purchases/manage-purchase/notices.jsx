/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { isEmpty, merge, minBy } from 'lodash';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import config from '@automattic/calypso-config';
import { getAddNewPaymentMethodPath } from '../utils';
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
} from 'calypso/lib/purchases';
import {
	isDomainTransfer,
	isConciergeSession,
	isPlan,
	isDomainRegistration,
	isMonthly,
} from '@automattic/calypso-products';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { managePurchase } from 'calypso/me/purchases/paths';
import UpcomingRenewalsDialog from 'calypso/me/purchases/upcoming-renewals/upcoming-renewals-dialog';

/**
 * Style dependencies
 */
import './notices.scss';

const eventProperties = ( warning ) => ( { warning, position: 'individual-purchase' } );

class PurchaseNotice extends Component {
	static propTypes = {
		isDataLoading: PropTypes.bool,
		handleRenew: PropTypes.func,
		handleRenewMultiplePurchases: PropTypes.func,
		purchase: PropTypes.object,
		purchaseAttachedTo: PropTypes.object,
		renewableSitePurchases: PropTypes.arrayOf( PropTypes.object ).isRequired,
		selectedSite: PropTypes.object,
		changePaymentMethodPath: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		getManagePurchaseUrlFor: PropTypes.func,
		getAddNewPaymentMethodUrlFor: PropTypes.func,
		isProductOwner: PropTypes.bool,
	};

	static defaultProps = {
		getManagePurchaseUrlFor: managePurchase,
		getAddNewPaymentMethodUrlFor: getAddNewPaymentMethodPath,
	};

	state = {
		showUpcomingRenewalsDialog: false,
	};

	getExpiringText( purchase ) {
		const { translate, moment, selectedSite } = this.props;
		const expiry = moment( purchase.expiryDate );

		if ( selectedSite && purchase.expiryStatus === 'manualRenew' ) {
			return this.getExpiringLaterText( purchase );
		}

		if ( isMonthly( purchase.productSlug ) ) {
			const daysToExpiry = moment( expiry.diff( moment() ) ).format( 'D' );

			return translate(
				'%(purchaseName)s will expire and be removed from your site %(expiry)s days. ',
				{
					args: {
						purchaseName: getName( purchase ),
						expiry: daysToExpiry,
					},
				}
			);
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
	 *
	 * @param  {object} purchase  The purchase object
	 * @param  {React.Component} autoRenewingUpgradesLink  An optional link component, for linking to other purchases on the site that are auto-renewing rather than expiring
	 * @returns  {string}  Translated text for the warning message.
	 */
	getExpiringLaterText( purchase, autoRenewingUpgradesLink = null ) {
		const { translate, moment } = this.props;
		const expiry = moment( purchase.expiryDate );

		const translateOptions = {
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

	renderRenewNoticeAction( onClick ) {
		const { changePaymentMethodPath, purchase, translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! this.props.selectedSite ) {
			return null;
		}

		if (
			! hasPaymentMethod( purchase ) &&
			( ! canExplicitRenew( purchase ) || shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) )
		) {
			return (
				<NoticeAction href={ changePaymentMethodPath }>
					{ config.isEnabled( 'purchases/new-payment-methods' )
						? translate( 'Add Payment Method' )
						: translate( 'Add Credit Card' ) }
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
				<NoticeAction href={ changePaymentMethodPath }>
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

	trackImpression( warning ) {
		return (
			<TrackComponentView
				eventName="calypso_subscription_warning_impression"
				eventProperties={ eventProperties( warning ) }
			/>
		);
	}

	trackClick( warning ) {
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

	handleExpiringNoticeRenewSelection = ( selectedRenewableSitePurchases ) => {
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
		const currentPurchase = usePlanInsteadOfIncludedPurchase ? purchaseAttachedTo : purchase;
		const includedPurchase = purchase;

		if ( ! isExpiring( currentPurchase ) ) {
			return null;
		}

		let noticeStatus = 'is-info';

		if ( isCloseToExpiration( currentPurchase ) && ! isRecentMonthlyPurchase( currentPurchase ) ) {
			noticeStatus = 'is-error';
		}

		if ( usePlanInsteadOfIncludedPurchase && ! selectedSite ) {
			return null;
		}

		if ( usePlanInsteadOfIncludedPurchase ) {
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
		const currentPurchase = purchaseIsIncludedInPlan ? purchaseAttachedTo : purchase;
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
					: null,
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

		let noticeStatus = null;
		let noticeIcon = null;
		let noticeActionHref = null;
		let noticeActionOnClick = null;
		let noticeActionText = '';
		let noticeImpressionName = '';
		let noticeText = '';

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
			} else {
				noticeStatus = showCreditCardExpiringWarning( currentPurchase ) ? 'is-error' : 'is-info';
				noticeActionHref = getAddNewPaymentMethodUrlFor( selectedSite.slug );
				noticeActionOnClick = this.handleExpiringCardNoticeUpdateAll;
				noticeActionText = translate( 'Update all' );
				noticeImpressionName = 'current-renews-soon-others-renew-soon-cc-expiring';
				noticeText = translate(
					'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.',
					merge( translateOptions, { args: this.creditCardDetails( currentPurchase ) } )
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
			! anotherPurchaseIsExpiring
		) {
			if ( ! currentPurchaseCreditCardExpiresBeforeSubscription ) {
				noticeStatus = 'is-success';
				noticeIcon = 'info';
				noticeImpressionName = 'current-renews-later-others-renew-soon';
				noticeText = translate(
					'You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon.',
					translateOptions
				);
			} else {
				noticeStatus = 'is-info';
				noticeActionHref = getAddNewPaymentMethodUrlFor( selectedSite.slug );
				noticeActionOnClick = this.handleExpiringCardNoticeUpdateAll;
				noticeActionText = translate( 'Update all' );
				noticeImpressionName = 'current-renews-later-others-renew-soon-cc-expiring';
				noticeText = translate(
					'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. You have {{link}}other upgrades{{/link}} on this site that are scheduled to renew soon and may also be affected. Please update the payment information for all your subscriptions.',
					merge( translateOptions, { args: this.creditCardDetails( currentPurchase ) } )
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
						<NoticeAction href={ noticeActionHref } onClick={ noticeActionOnClick }>
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
	 *
	 * @param {object} purchase - the purchase to get credit card details from
	 * @returns {object}  Translation arguments containing information on the card type, number, and expiry
	 */
	creditCardDetails = ( purchase ) => {
		const { moment } = this.props;
		const {
			payment: { creditCard },
		} = purchase;

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
			! this.props.selectedSite
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
							args: this.creditCardDetails( purchase ),
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
		const {
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
		const currentPurchase = usePlanInsteadOfIncludedPurchase ? purchaseAttachedTo : purchase;
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

	render() {
		if ( this.props.isDataLoading ) {
			return null;
		}

		if ( isDomainTransfer( this.props.purchase ) ) {
			return null;
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

		if ( isPartnerPurchase( this.props.purchase ) ) {
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
