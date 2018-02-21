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
	showCreditCardExpiringWarning,
} from 'lib/purchases';
import { isDomainTransfer } from 'lib/products-values';
import { getPurchase, getSelectedSite } from '../utils';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { isMonthly } from 'lib/plans/constants';
import TrackComponentView from 'lib/analytics/track-component-view';

const eventProperties = warning => ( { warning, position: 'individual-purchase' } );

class PurchaseNotice extends Component {
	static propTypes = {
		isDataLoading: PropTypes.bool,
		handleRenew: PropTypes.func,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		editCardDetailsPath: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
	};

	getExpiringText( purchase ) {
		const { translate, moment, selectedSite } = this.props;
		if ( selectedSite && purchase.expiryStatus === 'manualRenew' ) {
			return translate(
				'%(purchaseName)s will expire and be removed from your site %(expiry)s. ' +
					'Please, add a credit card if you want it to autorenew. ',
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
		const purchase = getPurchase( this.props );
		const { editCardDetailsPath, translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		if ( ! canExplicitRenew( purchase ) ) {
			return (
				<NoticeAction href={ editCardDetailsPath }>
					{ translate( 'Enable Auto Renew' ) }
				</NoticeAction>
			);
		}

		return <NoticeAction onClick={ onClick }>{ translate( 'Renew Now' ) }</NoticeAction>;
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
		const { moment } = this.props;
		const purchase = getPurchase( this.props );
		let noticeStatus = 'is-info';
		if ( ! isExpiring( purchase ) ) {
			return null;
		}

		if ( purchase.expiryMoment < moment().add( 90, 'days' ) ) {
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
		const { translate, editCardDetailsPath } = this.props;
		const purchase = getPurchase( this.props ),
			{ payment: { creditCard } } = purchase;

		if (
			isExpired( purchase ) ||
			isOneTimePurchase( purchase ) ||
			isIncludedWithPlan( purchase ) ||
			! getSelectedSite( this.props )
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
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

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

	render() {
		if ( this.props.isDataLoading ) {
			return null;
		}

		if ( isDomainTransfer( getPurchase( this.props ) ) ) {
			return null;
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

const mapStateToProps = null;
const mapDispatchToProps = { recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( PurchaseNotice ) );
