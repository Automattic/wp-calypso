/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import config from 'config';
import {
	canExplicitRenew,
	creditCardExpiresBeforeSubscription,
	getName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRenewable,
	hasPaymentMethod,
	showCreditCardExpiringWarning,
	isPaidWithCredits,
	subscribedWithinPastWeek,
	shouldAddPaymentSourceInsteadOfRenewingNow,
} from 'lib/purchases';
import { isDomainTransfer, isConciergeSession } from 'lib/products-values';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { isMonthly } from 'lib/plans/constants';
import TrackComponentView from 'lib/analytics/track-component-view';

const eventProperties = warning => ( { warning, position: 'individual-purchase' } );

class PurchaseNotice extends Component {
	static propTypes = {
		isDataLoading: PropTypes.bool,
		handleRenew: PropTypes.func,
		purchase: PropTypes.object,
		selectedSite: PropTypes.object,
		editCardDetailsPath: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	};

	getExpiringText( purchase ) {
		const { translate, moment, selectedSite } = this.props;

		let t1 = translate(
			'Absolutely. Get started on WordPress.com for free and upgrade whenever you need. You can also try our Premium and Business Plans for 30 days. If you’re not satisfied, we’ll refund your money. Note that for the domain registration-related portion of the upgrade, the refund window is 96 hours.'
		);

		const t2 = translate(
			'All plans include a 30-day money-back guarantee (96 hours for domains).'
		);

		const t3 = translate(
			"P.S.: If you aren't totally thrilled with everything the upgraded WordPress.com plans have to offer, simply let us know any time during the first 30 days (96 hours for domains) and you'll receive a full refund."
		);

		const t4 = translate(
			'Which means you can upgrade today and try one of our paid plans for 30 days, completely risk free (96 hours for domains). If you decide the upgraded plan isn’t for you, simply contact us and we’ll give you a full refund.'
		);

		const t5 = translate(
			'We proudly stand behind the quality of WordPress.&#8203;com. All of our plans include a full 30 day money-back guarantee (96 hours for domains).'
		);

		const t6 = translate(
			'P.S.: All WordPress.&#8203;com plan upgrades come with a 30 day money-back guarantee (96 hours for domains).'
		);

		const t7 = translate(
			'<b>P.S.:</b> All WordPress.&#8203;com plan upgrades come with a 30 day money-back guarantee (96 hours for domains).'
		);

		const t8 = translate(
			'And remember, all plan upgrades include a 30 day money-back guarantee (96 hours for domains).'
		);

		const t9 = translate(
			"P.S. Upgrading your plan is risk-free! If you decide for any reason that you don't love your upgrade, we'll give you a full refund within 30 days of purchase (96 hours for domains)."
		);

		// Stop the linter from complaining.
		if ( t1 || t2 || t3 || t4 || t5 || t6 || t7 || t8 || t9 ) {
			t1 = t2;
		}

		if ( selectedSite && purchase.expiryStatus === 'manualRenew' ) {
			if ( isPaidWithCredits( purchase ) ) {
				return translate(
					'You purchased %(purchaseName)s with credits. Please add a credit card before your ' +
						"plan expires %(expiry)s so that you don't lose out on your paid features!",
					{
						args: {
							purchaseName: getName( purchase ),
							expiry: moment( purchase.expiryMoment ).fromNow(),
						},
					}
				);
			}

			if ( config.isEnabled( 'autorenewal-toggle' ) && hasPaymentMethod( purchase ) ) {
				return translate(
					'%(purchaseName)s will expire and be removed from your site %(expiry)s. ' +
						"Please enable auto-renewal so you don't lose out on your paid features!",
					{
						args: {
							purchaseName: getName( purchase ),
							expiry: moment( purchase.expiryMoment ).fromNow(),
						},
					}
				);
			}

			return translate(
				'%(purchaseName)s will expire and be removed from your site %(expiry)s. ' +
					"Add a credit card so you don't lose out on your paid features!",
				{
					args: {
						purchaseName: getName( purchase ),
						expiry: moment( purchase.expiryMoment ).fromNow(),
					},
				}
			);
		}
		if ( isMonthly( purchase.productSlug ) ) {
			const expiryMoment = moment( purchase.expiryMoment );
			const daysToExpiry = moment( expiryMoment.diff( moment() ) ).format( 'D' );

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
				expiry: moment( purchase.expiryMoment ).fromNow(),
			},
		} );
	}

	renderRenewNoticeAction( onClick ) {
		const { editCardDetailsPath, purchase, translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! this.props.selectedSite ) {
			return null;
		}

		if (
			( ! config.isEnabled( 'autorenewal-toggle' ) || ! hasPaymentMethod( purchase ) ) &&
			( ! canExplicitRenew( purchase ) ||
				shouldAddPaymentSourceInsteadOfRenewingNow( purchase.expiryMoment ) )
		) {
			return (
				<NoticeAction href={ editCardDetailsPath }>{ translate( 'Add Credit Card' ) }</NoticeAction>
			);
		}

		// With the toggle, it doesn't make much sense to have this button.
		return (
			! config.isEnabled( 'autorenewal-toggle' ) && (
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

	renderPurchaseExpiringNotice() {
		const { moment, purchase } = this.props;
		let noticeStatus = 'is-info';
		if ( ! isExpiring( purchase ) ) {
			return null;
		}

		if (
			! subscribedWithinPastWeek( purchase ) &&
			purchase.expiryMoment < moment().add( 90, 'days' )
		) {
			noticeStatus = 'is-error';
		}

		return (
			<Notice
				className="manage-purchase__purchase-expiring-notice"
				showDismiss={ false }
				status={ noticeStatus }
				text={ this.getExpiringText( purchase ) }
			>
				{ this.renderRenewNoticeAction( this.handleExpiringNoticeRenewal ) }
				{ this.trackImpression( 'purchase-expiring' ) }
			</Notice>
		);
	}

	onClickUpdateCreditCardDetails = () => {
		this.trackClick( 'credit-card-expiring' );
	};

	renderCreditCardExpiringNotice() {
		const { editCardDetailsPath, purchase, translate } = this.props;
		const {
			payment: { creditCard },
		} = purchase;

		if (
			isExpired( purchase ) ||
			isOneTimePurchase( purchase ) ||
			isIncludedWithPlan( purchase ) ||
			! this.props.selectedSite
		) {
			return null;
		}

		if ( creditCardExpiresBeforeSubscription( purchase ) ) {
			const linkComponent = editCardDetailsPath ? (
				<a onClick={ this.onClickUpdateCreditCardDetails } href={ editCardDetailsPath } />
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
							args: {
								cardType: creditCard.type.toUpperCase(),
								cardNumber: parseInt( creditCard.number, 10 ),
								cardExpiry: creditCard.expiryMoment.format( 'MMMM YYYY' ),
							},
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
		const { purchase, translate } = this.props;

		if ( ! isRenewable( purchase ) ) {
			return null;
		}

		if ( ! isExpired( purchase ) ) {
			return null;
		}

		return (
			<Notice
				showDismiss={ false }
				status="is-error"
				text={ translate( 'This purchase has expired and is no longer in use.' ) }
			>
				{ this.renderRenewNoticeAction( this.handleExpiredNoticeRenewal ) }
				{ this.trackImpression( 'purchase-expired' ) }
			</Notice>
		);
	}

	renderConciergeConsumedNotice() {
		const { purchase, translate } = this.props;

		if ( ! isConciergeSession( purchase ) ) {
			return null;
		}

		if ( ! isExpired( purchase ) ) {
			return null;
		}

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

	render() {
		if ( this.props.isDataLoading ) {
			return null;
		}

		if ( isDomainTransfer( this.props.purchase ) ) {
			return null;
		}

		const consumedConciergeSessionNotice = this.renderConciergeConsumedNotice();
		if ( consumedConciergeSessionNotice ) {
			return consumedConciergeSessionNotice;
		}

		const expiredNotice = this.renderExpiredRenewNotice();
		if ( expiredNotice ) {
			return expiredNotice;
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

export default connect(
	null,
	{ recordTracksEvent }
)( localize( PurchaseNotice ) );
