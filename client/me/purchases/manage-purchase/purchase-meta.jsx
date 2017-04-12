/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	creditCardExpiresBeforeSubscription,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	isPaidWithPayPalDirect,
	isRenewing,
	isSubscription,
	hasPaymentMethod,
	paymentLogoType,
} from 'lib/purchases';
import { isMonthly } from 'lib/plans/constants';
import { isDomainRegistration } from 'lib/products-values';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import { getUser } from 'state/users/selectors';
import paths from '../paths';
import PaymentLogo from 'components/payment-logo';
import UserItem from 'components/user';
import {
	canEditPaymentDetails,
	isDataLoading,
	getEditCardDetailsPath,
	getPurchase,
	getSelectedSite
} from '../utils';

class PurchaseMeta extends Component {
	static propTypes = {
		hasLoadedSites: React.PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: React.PropTypes.bool.isRequired,
		purchaseId: React.PropTypes.oneOfType( [
			React.PropTypes.number,
			React.PropTypes.bool
		] ).isRequired,
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
			React.PropTypes.undefined
		] )
	}

	static defaultProps = {
		hasLoadedSites: false,
		hasLoadedUserPurchasesFromServer: false,
		purchaseId: false,
	}

	renderPrice() {
		const { translate } = this.props;
		const purchase = getPurchase( this.props );
		const { amount, currencyCode, currencySymbol, productSlug } = purchase;
		const period = productSlug && isMonthly( productSlug ) ? translate( 'month' ) : translate( 'year' );

		if ( isOneTimePurchase( purchase ) ) {
			return translate( '%(currencySymbol)s%(amount)f %(currencyCode)s {{period}}(one-time){{/period}}', {
				args: { amount, currencyCode, currencySymbol },
				components: {
					period: <span className="manage-purchase__time-period" />
				}
			} );
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Free with Plan' );
		}

		return translate( '%(currencySymbol)s%(amount)f %(currencyCode)s {{period}}/ %(period)s{{/period}}', {
			args: {
				amount,
				currencyCode,
				currencySymbol,
				period
			},
			components: {
				period: <span className="manage-purchase__time-period" />
			}
		} );
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
			return translate( 'Domain auto-renews on' );
		}

		if ( isSubscription( purchase ) ) {
			return translate( 'Subscription auto-renews on' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return translate( 'Auto-renews on' );
		}

		return null;
	}

	renderRenewsOrExpiresOn() {
		const purchase = getPurchase( this.props );
		const { translate, moment } = this.props;

		if ( isIncludedWithPlan( purchase ) ) {
			const attachedPlanUrl = paths.managePurchase(
				this.props.selectedSite.slug,
				purchase.attachedToPurchaseId
			);

			return (
				<span>
					{ translate( 'Renews with Plan' ) }
					<a href={ attachedPlanUrl }>
						{ translate( 'View Plan' ) }
					</a>
				</span>
			);
		}

		if ( isExpiring( purchase ) || isExpired( purchase ) || creditCardExpiresBeforeSubscription( purchase ) ) {
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
			return (
				<span className="manage-purchase__content manage-purchase__detail">
					{ translate( 'Included with plan' ) }
				</span>
			);
		}

		if ( hasPaymentMethod( purchase ) ) {
			let paymentInfo = null;

			if ( isPaidWithCreditCard( purchase ) ) {
				paymentInfo = purchase.payment.creditCard.number;
			} else if ( isPaidWithPayPalDirect( purchase ) ) {
				paymentInfo = translate( 'expiring %(cardExpiry)s', {
					args: {
						cardExpiry: purchase.payment.expiryMoment.format( 'MMMM YYYY' )
					},
				} );
			}

			return (
				<span className="manage-purchase__content manage-purchase__detail">
					<PaymentLogo type={ paymentLogoType( purchase ) } />
					{ paymentInfo }
				</span>
			);
		}

		return (
			<span className="manage-purchase__content manage-purchase__detail">
				{ translate( 'None' ) }
			</span>
		);
	}

	renderPaymentDetails() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( isOneTimePurchase( purchase ) ) {
			return null;
		}

		const paymentDetails = (
			<span>
				<em className="manage-purchase__content manage-purchase__detail-label">{ translate( 'Payment method' ) }</em>
				{ this.renderPaymentInfo() }
			</span>
		);

		if ( ! canEditPaymentDetails( purchase ) || ! isPaidWithCreditCard( purchase ) || ! getSelectedSite( this.props ) ) {
			return (
				<li>
					{ paymentDetails }
				</li>
			);
		}

		return (
			<li>
				<a href={ getEditCardDetailsPath( this.props.selectedSite, purchase ) }>
					{ paymentDetails }
				</a>
			</li>
		);
	}

	renderPlaceholder() {
		return (
			<ul className="manage-purchase__meta">
				{
					times( 4, ( i ) => (
						<li key={ i }>
							<em className="manage-purchase__content manage-purchase__detail-label" />
							<span className="manage-purchase__content manage-purchase__detail" />
						</li>
					) )
				}
			</ul>
		);
	}

	render() {
		const { translate, purchaseId, owner } = this.props;

		if ( isDataLoading( this.props ) || ! purchaseId ) {
			return this.renderPlaceholder();
		}

		const displayUser = Object.assign( {}, owner, { name: owner.display_name } );

		return (
			<ul className="manage-purchase__meta">
				<li>
					<em className="manage-purchase__content manage-purchase__detail-label">{ translate( 'Owner' ) }</em>
					<span className="manage-purchase__content manage-purchase__detail">
						<UserItem user={ displayUser } />
					</span>
				</li>
				<li>
					<em className="manage-purchase__content manage-purchase__detail-label">{ translate( 'Price' ) }</em>
					<span className="manage-purchase__content manage-purchase__detail">{ this.renderPrice() }</span>
				</li>
				<li>
					<em className="manage-purchase__content manage-purchase__detail-label">{ this.renderRenewsOrExpiresOnLabel() }</em>
					<span className="manage-purchase__content manage-purchase__detail">{ this.renderRenewsOrExpiresOn() }</span>
				</li>
				{ this.renderPaymentDetails() }
			</ul>
		);
	}
}

export default connect(
	( state, props ) => {
		const purchase = getByPurchaseId( state, props.purchaseId );

		return {
			hasLoadedSites: ! isRequestingSites( state ),
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			selectedPurchase: purchase,
			selectedSite: getSelectedSiteSelector( state ),
			owner: purchase ? getUser( state, purchase.userId ) : null,
		};
	}
)( localize( PurchaseMeta ) );
