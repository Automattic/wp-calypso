/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	getName,
	creditCardExpiresBeforeSubscription,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	cardProcessorSupportsUpdates,
	isPaidWithPayPalDirect,
	isRenewing,
	isSubscription,
	paymentLogoType,
} from 'lib/purchases';
import { isMonthly } from 'lib/plans/constants';
import { isDomainRegistration, isDomainTransfer } from 'lib/products-values';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getUser } from 'state/users/selectors';
import { managePurchase } from '../paths';
import PaymentLogo from 'components/payment-logo';
import { CALYPSO_CONTACT } from 'lib/url/support';
import UserItem from 'components/user';
import {
	canEditPaymentDetails,
	isDataLoading,
	getEditCardDetailsPath,
	getPurchase,
} from '../utils';

class PurchaseMeta extends Component {
	static propTypes = {
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		purchaseId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ).isRequired,
		selectedPurchase: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
	};

	static defaultProps = {
		hasLoadedSites: false,
		hasLoadedUserPurchasesFromServer: false,
		purchaseId: false,
	};

	renderPrice() {
		const { translate } = this.props;
		const purchase = getPurchase( this.props );
		const { amount, currencyCode, currencySymbol, productSlug } = purchase;
		const period =
			productSlug && isMonthly( productSlug ) ? translate( 'month' ) : translate( 'year' );

		if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
			return translate(
				'%(currencySymbol)s%(amount)f %(currencyCode)s {{period}}(one-time){{/period}}',
				{
					args: { amount, currencyCode, currencySymbol },
					components: {
						period: <span className="manage-purchase__time-period" />,
					},
				}
			);
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Free with Plan' );
		}

		return translate(
			'%(currencySymbol)s%(amount)f %(currencyCode)s {{period}}/ %(period)s{{/period}}',
			{
				args: {
					amount,
					currencyCode,
					currencySymbol,
					period,
				},
				components: {
					period: <span className="manage-purchase__time-period" />,
				},
			}
		);
	}

	renderRenewsOrExpiresOnLabel() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( isExpiring( purchase ) || creditCardExpiresBeforeSubscription( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				return translate( 'Domain expires on' );
			}

			if ( isSubscription( purchase ) ) {
				return translate( 'Subscription expires on' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				return translate( 'Expires on' );
			}
		}

		if ( isExpired( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				return translate( 'Domain expired on' );
			}

			if ( isSubscription( purchase ) ) {
				return translate( 'Subscription expired on' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				return translate( 'Expired on' );
			}
		}

		if ( isDomainRegistration( purchase ) ) {
			return translate( 'Domain renews on' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Subscription renews on' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Renews on' );
		}

		return null;
	}

	renderRenewsOrExpiresOn() {
		const purchase = getPurchase( this.props );
		const { translate, moment } = this.props;

		if ( isIncludedWithPlan( purchase ) ) {
			const attachedPlanUrl = managePurchase(
				this.props.selectedSite.slug,
				purchase.attachedToPurchaseId
			);

			return (
				<span>
					<a href={ attachedPlanUrl }>{ translate( 'Renews with Plan' ) }</a>
				</span>
			);
		}

		if (
			isExpiring( purchase ) ||
			isExpired( purchase ) ||
			creditCardExpiresBeforeSubscription( purchase )
		) {
			return moment( purchase.expiryDate ).format( 'LL' );
		}

		if ( isRenewing( purchase ) ) {
			return moment( purchase.renewDate ).format( 'LL' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Never Expires' );
		}
	}

	renderPaymentInfo() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( isIncludedWithPlan( purchase ) ) {
			return <span className="manage-purchase__detail">{ translate( 'Included with plan' ) }</span>;
		}

		if ( typeof purchase.payment.type !== 'undefined' ) {
			let paymentInfo = null;

			if ( isPaidWithCreditCard( purchase ) ) {
				paymentInfo = purchase.payment.creditCard.number;
			} else if ( isPaidWithPayPalDirect( purchase ) ) {
				paymentInfo = translate( 'expiring %(cardExpiry)s', {
					args: {
						cardExpiry: purchase.payment.expiryMoment.format( 'MMMM YYYY' ),
					},
				} );
			}

			return (
				<span className="manage-purchase__detail">
					<PaymentLogo type={ paymentLogoType( purchase ) } />
					{ paymentInfo }
				</span>
			);
		}

		return <span className="manage-purchase__detail">{ translate( 'None' ) }</span>;
	}

	renderPaymentDetails() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
			return null;
		}

		const paymentDetails = (
			<span>
				<em className="manage-purchase__detail-label">{ translate( 'Payment method' ) }</em>
				{ this.renderPaymentInfo() }
			</span>
		);

		if (
			! canEditPaymentDetails( purchase ) ||
			! isPaidWithCreditCard( purchase ) ||
			! cardProcessorSupportsUpdates( purchase ) ||
			! this.props.selectedSite
		) {
			return <li>{ paymentDetails }</li>;
		}

		return (
			<li>
				<a href={ getEditCardDetailsPath( this.props.selectedSite.slug, purchase ) }>
					{ paymentDetails }
				</a>
			</li>
		);
	}

	renderContactSupportToRenewMessage() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( this.props.selectedSite ) {
			return null;
		}

		return (
			<div className="manage-purchase__contact-support">
				{ translate(
					'You are the owner of %(purchaseName)s but because you are no longer a user on %(siteSlug)s, ' +
						'renewing it will require staff assistance. Please {{contactSupportLink}}contact support{{/contactSupportLink}}, ' +
						'and consider transferring this purchase to another active user on %(siteSlug)s to avoid this issue in the future.',
					{
						args: {
							purchaseName: getName( purchase ),
							siteSlug: this.props.selectedPurchase.domain,
						},
						components: {
							contactSupportLink: <a href={ CALYPSO_CONTACT } />,
						},
					}
				) }
			</div>
		);
	}

	renderOwner() {
		const { translate, owner } = this.props;
		if ( ! owner ) {
			return null;
		}

		return (
			<li>
				<em className="manage-purchase__detail-label">{ translate( 'Owner' ) }</em>
				<span className="manage-purchase__detail">
					<UserItem user={ { ...owner, name: owner.display_name } } />
				</span>
			</li>
		);
	}

	renderExpiration() {
		const purchase = getPurchase( this.props );
		if ( isDomainTransfer( purchase ) ) {
			return null;
		}

		return (
			<li>
				<em className="manage-purchase__detail-label">{ this.renderRenewsOrExpiresOnLabel() }</em>
				<span className="manage-purchase__detail">{ this.renderRenewsOrExpiresOn() }</span>
			</li>
		);
	}

	renderPlaceholder() {
		return (
			<ul className="manage-purchase__meta">
				{ times( 4, i => (
					<li key={ i }>
						<em className="manage-purchase__detail-label" />
						<span className="manage-purchase__detail" />
					</li>
				) ) }
			</ul>
		);
	}

	render() {
		const { translate, purchaseId } = this.props;

		if ( isDataLoading( this.props ) || ! purchaseId ) {
			return this.renderPlaceholder();
		}

		return (
			<div>
				<ul className="manage-purchase__meta">
					{ this.renderOwner() }
					<li>
						<em className="manage-purchase__detail-label">{ translate( 'Price' ) }</em>
						<span className="manage-purchase__detail">{ this.renderPrice() }</span>
					</li>
					{ this.renderExpiration() }
					{ this.renderPaymentDetails() }
				</ul>
				{ this.renderContactSupportToRenewMessage() }
			</div>
		);
	}
}

export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );

	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: purchase,
		selectedSite: getSelectedSite( state ),
		owner: purchase ? getUser( state, purchase.userId ) : null,
	};
} )( localize( PurchaseMeta ) );
