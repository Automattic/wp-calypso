/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { times } from 'lodash';

/**
 * Internal Dependencies
 */
import config from 'config';
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
import { disableAutoRenew, enableAutoRenew } from 'lib/upgrades/actions';
import {
	isPlan,
	isDomainRegistration,
	isDomainTransfer,
	isConciergeSession,
} from 'lib/products-values';
import { getPlan } from 'lib/plans';

import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
	isFetchingSitePurchases,
} from 'state/purchases/selectors';
import { fetchSitePurchases } from 'state/purchases/actions';
import { getSite, isRequestingSites } from 'state/sites/selectors';
import { getUser } from 'state/users/selectors';
import { managePurchase } from '../paths';
import AutorenewalDisablingDialog from './autorenewal-disabling-dialog';
import FormToggle from 'components/forms/form-toggle';
import PaymentLogo from 'components/payment-logo';
import { CALYPSO_CONTACT } from 'lib/url/support';
import UserItem from 'components/user';
import { canEditPaymentDetails, getEditCardDetailsPath, isDataLoading } from '../utils';
import { TERM_BIENNIALLY, TERM_MONTHLY } from 'lib/plans/constants';

class PurchaseMeta extends Component {
	static propTypes = {
		hasLoadedSites: PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: PropTypes.bool.isRequired,
		purchaseId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ).isRequired,
		purchase: PropTypes.object,
		site: PropTypes.object,
		siteSlug: PropTypes.string.isRequired,
	};

	static defaultProps = {
		hasLoadedSites: false,
		hasLoadedUserPurchasesFromServer: false,
		purchaseId: false,
	};

	state = {
		...( config.isEnabled( 'autorenewal-toggle' ) && {
			isAutorenewalEnabled: false,
		} ),
	};

	renderPrice() {
		const { purchase, translate } = this.props;
		const { priceText, currencyCode, productSlug } = purchase;
		const plan = getPlan( productSlug );
		let period = translate( 'year' );

		if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
			return translate( '%(priceText)s %(currencyCode)s {{period}}(one-time){{/period}}', {
				args: { priceText, currencyCode },
				components: {
					period: <span className="manage-purchase__time-period" />,
				},
			} );
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Free with Plan' );
		}

		if ( plan && plan.term ) {
			switch ( plan.term ) {
				case TERM_BIENNIALLY:
					period = translate( 'two years' );
					break;

				case TERM_MONTHLY:
					period = translate( 'month' );
					break;
			}
		}

		return translate( '%(priceText)s %(currencyCode)s {{period}}/ %(period)s{{/period}}', {
			args: {
				priceText,
				currencyCode,
				period,
			},
			components: {
				period: <span className="manage-purchase__time-period" />,
			},
		} );
	}

	renderRenewsOrExpiresOnLabel() {
		const { purchase, translate } = this.props;

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

			if ( isConciergeSession( purchase ) ) {
				return translate( 'Session used on' );
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
		const { moment, purchase, siteSlug, translate } = this.props;

		if ( isIncludedWithPlan( purchase ) ) {
			const attachedPlanUrl = managePurchase( siteSlug, purchase.attachedToPurchaseId );

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
		const { purchase, translate } = this.props;

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Included with plan' );
		}

		if ( typeof purchase.payment.type !== 'undefined' ) {
			let paymentInfo = null;

			if ( purchase.payment.type === 'credits' ) {
				return translate( 'Credits' );
			}

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
				<Fragment>
					<PaymentLogo type={ paymentLogoType( purchase ) } />
					{ paymentInfo }
				</Fragment>
			);
		}

		return translate( 'None' );
	}

	renderPaymentDetails() {
		const { purchase, translate } = this.props;

		if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
			return null;
		}

		const paymentDetails = (
			<span>
				<em className="manage-purchase__detail-label">{ translate( 'Payment method' ) }</em>
				<span className="manage-purchase__detail">{ this.renderPaymentInfo() }</span>
			</span>
		);

		if (
			! canEditPaymentDetails( purchase ) ||
			! isPaidWithCreditCard( purchase ) ||
			! cardProcessorSupportsUpdates( purchase ) ||
			! this.props.site
		) {
			return <li>{ paymentDetails }</li>;
		}

		return (
			<li>
				<a href={ getEditCardDetailsPath( this.props.siteSlug, purchase ) }>{ paymentDetails }</a>
			</li>
		);
	}

	renderContactSupportToRenewMessage() {
		const { purchase, translate } = this.props;

		if ( this.props.site ) {
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
							siteSlug: this.props.purchase.domain,
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

	onCloseAutorenewalDisablingDialog = () => {
		this.setState( {
			showAutorenewalDisablingDialog: false,
		} );
	};

	onToggleAutorenewal = () => {
		const {
			purchase: { id: purchaseId, siteId },
			isAutorenewalEnabled,
		} = this.props;

		if ( isAutorenewalEnabled ) {
			this.setState( {
				showAutorenewalDisablingDialog: true,
			} );
		}

		const updateAutoRenew = isAutorenewalEnabled ? disableAutoRenew : enableAutoRenew;

		this.setState( {
			isTogglingToward: ! isAutorenewalEnabled,
			isRequestingAutoRenew: true,
		} );

		updateAutoRenew( purchaseId, success => {
			this.setState( {
				isRequestingAutoRenew: false,
			} );
			if ( success ) {
				this.props.fetchSitePurchases( siteId );
			}
		} );
	};

	isUpdatingAutoRenew = () => {
		return this.state.isRequestingAutoRenew || this.props.fetchingSitePurchases;
	};

	getToggleUiStatus() {
		if ( this.isUpdatingAutoRenew() ) {
			return this.state.isTogglingToward;
		}

		return this.props.isAutorenewalEnabled;
	}

	renderExpiration() {
		const { purchase, translate, isAutorenewalEnabled } = this.props;

		if ( isDomainTransfer( purchase ) ) {
			return null;
		}

		// The toggle is only available for the plan subscription for now, and will be gradully rolled out to
		// domains and G suite.
		if (
			config.isEnabled( 'autorenewal-toggle' ) &&
			purchase.renewMoment &&
			isPlan( purchase ) &&
			! isExpired( purchase )
		) {
			const dateSpan = <span className="manage-purchase__detail-date-span" />;
			const subsRenewText = isAutorenewalEnabled
				? translate( 'Auto-renew is ON' )
				: translate( 'Auto-renew is OFF' );
			const subsBillingText = isAutorenewalEnabled
				? translate( 'You will be billed on {{dateSpan}}%(renewDate)s{{/dateSpan}}', {
						args: {
							renewDate: purchase.renewMoment.format( 'LL' ),
						},
						components: {
							dateSpan,
						},
				  } )
				: translate( 'Expires on {{dateSpan}}%(expireDate)s{{/dateSpan}}', {
						args: {
							expireDate: purchase.expiryMoment.format( 'LL' ),
						},
						components: {
							dateSpan,
						},
				  } );

			return (
				<li>
					<em className="manage-purchase__detail-label">{ translate( 'Subscription Renewal' ) }</em>
					<span className="manage-purchase__detail">{ subsRenewText }</span>
					<span className="manage-purchase__detail">{ subsBillingText }</span>
					<span className="manage-purchase__detail">
						<FormToggle
							checked={ this.getToggleUiStatus() }
							disabled={ this.isUpdatingAutoRenew() }
							onChange={ this.onToggleAutorenewal }
						/>
					</span>
				</li>
			);
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
		const { translate, purchaseId, purchase, site } = this.props;

		if ( isDataLoading( this.props ) || ! purchaseId ) {
			return this.renderPlaceholder();
		}

		return (
			<Fragment>
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
				{ config.isEnabled( 'autorenewal-toggle' ) && this.state.showAutorenewalDisablingDialog && (
					<AutorenewalDisablingDialog
						planName={ site.plan.product_name_short }
						siteDomain={ site.domain }
						expiryDate={ purchase.expiryMoment.format( 'LL' ) }
						onClose={ this.onCloseAutorenewalDisablingDialog }
					/>
				) }
			</Fragment>
		);
	}
}

export default connect(
	( state, { purchaseId } ) => {
		const purchase = getByPurchaseId( state, purchaseId );

		return {
			hasLoadedSites: ! isRequestingSites( state ),
			hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
			fetchingSitePurchases: isFetchingSitePurchases( state ),
			purchase,
			site: purchase ? getSite( state, purchase.siteId ) : null,
			owner: purchase ? getUser( state, purchase.userId ) : null,
			isAutorenewalEnabled: purchase ? ! isExpiring( purchase ) : null,
		};
	},
	{
		fetchSitePurchases,
	}
)( localize( PurchaseMeta ) );
