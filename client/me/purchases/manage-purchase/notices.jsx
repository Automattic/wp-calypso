/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import {
	creditCardExpiresBeforeSubscription,
	getName,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isRedeemable,
	isRenewable,
	showCreditCardExpiringWarning
} from 'lib/purchases';
import { getPurchase, getSelectedSite } from '../utils';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { isMonthly } from 'lib/plans/constants';

class PurchaseNotice extends Component {
	static propTypes = {
		isDataLoading: React.PropTypes.bool,
		handleRenew: React.PropTypes.func,
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
			React.PropTypes.undefined
		] ),
		editCardDetailsPath: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.bool
		] )
	}

	getExpiringText( purchase ) {
		const { translate, moment, selectedSite } = this.props;
		if ( selectedSite && purchase.expiryStatus === 'manualRenew' ) {
			return translate( '%(purchaseName)s will expire and be removed from your site %(expiry)s. ' +
				'Please, add a credit card if you want it to autorenew. ',
				{
					args: {
						purchaseName: getName( purchase ),
						expiry: moment( purchase.expiryMoment ).fromNow()
					}
				}
			);
		}
		if ( isMonthly( purchase.productSlug ) ) {
			const expiryMoment = moment( purchase.expiryMoment );
			const daysToExpiry = moment( expiryMoment.diff( moment() ) ).format( 'D' );

			return translate( '%(purchaseName)s will expire and be removed from your site %(expiry)s days. ',
				{
					args: {
						purchaseName: getName( purchase ),
						expiry: daysToExpiry
					}
				}
			);
		}

		return translate( '%(purchaseName)s will expire and be removed from your site %(expiry)s.',
			{
				args: {
					purchaseName: getName( purchase ),
					expiry: moment( purchase.expiryMoment ).fromNow()
				}
			}
		);
	}

	renderRenewNoticeAction() {
		const { translate, handleRenew } = this.props;
		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<NoticeAction onClick={ handleRenew }>
				{ translate( 'Renew Now' ) }
			</NoticeAction>
		);
	}

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
				text={ this.getExpiringText( purchase ) }>
				{ this.renderRenewNoticeAction() }
			</Notice>
		);
	}

	renderCreditCardExpiringNotice() {
		const { translate, editCardDetailsPath } = this.props;
		const purchase = getPurchase( this.props ),
			{ payment: { creditCard } } = purchase;

		if ( isExpired( purchase ) || isOneTimePurchase( purchase ) || isIncludedWithPlan( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		if ( creditCardExpiresBeforeSubscription( purchase ) ) {
			return (
				<Notice
					className="manage-purchase__expiring-credit-card-notice"
					showDismiss={ false }
					status={ showCreditCardExpiringWarning( purchase ) ? 'is-error' : 'is-info' }>
					{
						translate( 'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s ' +
							'– before the next renewal. Please {{a}}update your payment information{{/a}}.', {
								args: {
									cardType: creditCard.type.toUpperCase(),
									cardNumber: creditCard.number,
									cardExpiry: creditCard.expiryMoment.format( 'MMMM YYYY' )
								},
								components: {
									a: editCardDetailsPath
										? <a href={ editCardDetailsPath } />
										: <span />
								}
							}
						)
					}
				</Notice>
			);
		}
	}

	renderExpiredRenewNotice() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( ! isRenewable( purchase ) && ! isRedeemable( purchase ) ) {
			return null;
		}

		if ( ! isExpired( purchase ) ) {
			return null;
		}

		return (
			<Notice
				showDismiss={ false }
				status="is-error"
				text={ translate( 'This purchase has expired and is no longer in use.' ) }>
				{ this.renderRenewNoticeAction() }
			</Notice>
		);
	}

	render() {
		if ( this.props.isDataLoading ) {
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

export default localize( PurchaseNotice );
