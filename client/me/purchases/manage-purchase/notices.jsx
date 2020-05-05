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
	isPartnerPurchase,
	isRenewable,
	isRechargeable,
	hasPaymentMethod,
	showCreditCardExpiringWarning,
	isPaidWithCredits,
	subscribedWithinPastWeek,
	shouldAddPaymentSourceInsteadOfRenewingNow,
} from 'lib/purchases';
import { isDomainTransfer, isConciergeSession } from 'lib/products-values';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { withLocalizedMoment } from 'components/localized-moment';
import { isMonthly } from 'lib/plans/constants';
import TrackComponentView from 'lib/analytics/track-component-view';

const eventProperties = ( warning ) => ( { warning, position: 'individual-purchase' } );

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
		const expiry = moment( purchase.expiryDate );

		if ( selectedSite && purchase.expiryStatus === 'manualRenew' ) {
			if ( isPaidWithCredits( purchase ) ) {
				return translate(
					'You purchased %(purchaseName)s with credits. Please add a credit card before your ' +
						"plan expires %(expiry)s so that you don't lose out on your paid features!",
					{
						args: {
							purchaseName: getName( purchase ),
							expiry: expiry.fromNow(),
						},
					}
				);
			}

			if ( hasPaymentMethod( purchase ) ) {
				if ( isRechargeable( purchase ) ) {
					return translate(
						'%(purchaseName)s will expire and be removed from your site %(expiry)s. ' +
							"Please enable auto-renewal so you don't lose out on your paid features!",
						{
							args: {
								purchaseName: getName( purchase ),
								expiry: expiry.fromNow(),
							},
						}
					);
				}

				return translate(
					'%(purchaseName)s will expire and be removed from your site %(expiry)s. ' +
						"Please renew before expiry so you don't lose out on your paid features!",
					{
						args: {
							purchaseName: getName( purchase ),
							expiry: expiry.fromNow(),
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
						expiry: expiry.fromNow(),
					},
				}
			);
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

	renderRenewNoticeAction( onClick ) {
		const { editCardDetailsPath, purchase, translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! this.props.selectedSite ) {
			return null;
		}

		if (
			! hasPaymentMethod( purchase ) &&
			( ! canExplicitRenew( purchase ) || shouldAddPaymentSourceInsteadOfRenewingNow( purchase ) )
		) {
			return (
				<NoticeAction href={ editCardDetailsPath }>{ translate( 'Add Credit Card' ) }</NoticeAction>
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

	renderPurchaseExpiringNotice() {
		const { moment, purchase } = this.props;
		let noticeStatus = 'is-info';
		if ( ! isExpiring( purchase ) ) {
			return null;
		}

		if (
			! subscribedWithinPastWeek( purchase ) &&
			purchase.expiryDate &&
			moment( purchase.expiryDate ) < moment().add( 90, 'days' )
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
		const { editCardDetailsPath, purchase, translate, moment } = this.props;
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
								cardExpiry: moment( creditCard.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
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

		if ( isDomainTransfer( this.props.purchase ) || isPartnerPurchase( this.props.purchase ) ) {
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

export default connect( null, { recordTracksEvent } )(
	localize( withLocalizedMoment( PurchaseNotice ) )
);
