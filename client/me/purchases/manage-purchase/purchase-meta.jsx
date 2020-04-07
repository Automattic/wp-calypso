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
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	isPaidWithCredits,
	cardProcessorSupportsUpdates,
	isPaidWithPayPalDirect,
	isRenewing,
	isSubscription,
	paymentLogoType,
	hasPaymentMethod,
} from 'lib/purchases';
import {
	isDomainRegistration,
	isDomainTransfer,
	isGoogleApps,
	isConciergeSession,
	isJetpackPlan,
	isJetpackProduct,
	isPlan,
	getProductFromSlug,
} from 'lib/products-values';
import { getPlan } from 'lib/plans';

import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSite, isRequestingSites } from 'state/sites/selectors';
import { getUser } from 'state/users/selectors';
import { managePurchase } from '../paths';
import AutoRenewToggle from './auto-renew-toggle';
import PaymentLogo from 'components/payment-logo';
import { CALYPSO_CONTACT, JETPACK_SUPPORT } from 'lib/url/support';
import UserItem from 'components/user';
import { withLocalizedMoment } from 'components/localized-moment';
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

	renderPrice() {
		const { purchase, translate } = this.props;
		const { priceText, currencyCode, productSlug } = purchase;
		const plan = getPlan( productSlug ) || getProductFromSlug( productSlug );
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

		if ( isExpiring( purchase ) ) {
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

		if ( isExpiring( purchase ) || isExpired( purchase ) ) {
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
		const { purchase, translate, moment } = this.props;
		const payment = purchase?.payment;

		if ( isIncludedWithPlan( purchase ) ) {
			return translate( 'Included with plan' );
		}

		if ( hasPaymentMethod( purchase ) ) {
			let paymentInfo = null;

			if ( isPaidWithCredits( purchase ) ) {
				return translate( 'Credits' );
			}

			if ( isPaidWithCreditCard( purchase ) ) {
				paymentInfo = payment.creditCard.number;
			} else if ( isPaidWithPayPalDirect( purchase ) ) {
				paymentInfo = translate( 'expiring %(cardExpiry)s', {
					args: {
						cardExpiry: moment( payment.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
					},
				} );
			}

			return (
				<>
					<PaymentLogo type={ paymentLogoType( purchase ) } />
					{ paymentInfo }
				</>
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

	renderRenewErrorMessage() {
		const { isJetpack, purchase, translate } = this.props;

		if ( this.props.site ) {
			return null;
		}

		if ( isJetpack ) {
			return (
				<div className="manage-purchase__footnotes">
					{ translate(
						'%(purchaseName)s expired on %(siteSlug)s, and the site is no longer connected to WordPress.com. ' +
							'To renew this purchase, please reconnect %(siteSlug)s to your WordPress.com account, then complete your purchase. ' +
							'Now sure how to reconnect? {{supportPageLink}}Here are the instructions{{/supportPageLink}}.',
						{
							args: {
								purchaseName: getName( purchase ),
								siteSlug: this.props.purchase.domain,
							},
							components: {
								supportPageLink: (
									<a
										href={
											JETPACK_SUPPORT + 'reconnecting-reinstalling-jetpack/#reconnecting-jetpack'
										}
									/>
								),
							},
						}
					) }
				</div>
			);
		}

		return (
			<div className="manage-purchase__footnotes">
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

	renderExpiration() {
		const { purchase, site, translate, moment, isAutorenewalEnabled } = this.props;

		if ( isDomainTransfer( purchase ) ) {
			return null;
		}

		if (
			( isDomainRegistration( purchase ) || isPlan( purchase ) || isGoogleApps( purchase ) ) &&
			! isExpired( purchase )
		) {
			const dateSpan = <span className="manage-purchase__detail-date-span" />;
			const subsRenewText = isAutorenewalEnabled
				? translate( 'Auto-renew is ON' )
				: translate( 'Auto-renew is OFF' );
			const subsBillingText = isAutorenewalEnabled
				? translate( 'You will be billed on {{dateSpan}}%(renewDate)s{{/dateSpan}}', {
						args: {
							renewDate: purchase.renewDate && moment( purchase.renewDate ).format( 'LL' ),
						},
						components: {
							dateSpan,
						},
				  } )
				: translate( 'Expires on {{dateSpan}}%(expireDate)s{{/dateSpan}}', {
						args: {
							expireDate: moment( purchase.expiryDate ).format( 'LL' ),
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
					{ site && (
						<span className="manage-purchase__detail">
							<AutoRenewToggle
								planName={ site.plan.product_name_short }
								siteDomain={ site.domain }
								purchase={ purchase }
								toggleSource="manage-purchase"
							/>
						</span>
					) }
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
		const { translate, purchaseId } = this.props;

		if ( isDataLoading( this.props ) || ! purchaseId ) {
			return this.renderPlaceholder();
		}

		return (
			<>
				<ul className="manage-purchase__meta">
					{ this.renderOwner() }
					<li>
						<em className="manage-purchase__detail-label">{ translate( 'Price' ) }</em>
						<span className="manage-purchase__detail">{ this.renderPrice() }</span>
					</li>
					{ this.renderExpiration() }
					{ this.renderPaymentDetails() }
				</ul>
				{ this.renderRenewErrorMessage() }
			</>
		);
	}
}

export default connect( ( state, { purchaseId } ) => {
	const purchase = getByPurchaseId( state, purchaseId );

	return {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		purchase,
		site: purchase ? getSite( state, purchase.siteId ) : null,
		owner: purchase ? getUser( state, purchase.userId ) : null,
		isAutorenewalEnabled: purchase ? ! isExpiring( purchase ) : null,
		isJetpack: purchase && ( isJetpackPlan( purchase ) || isJetpackProduct( purchase ) ),
	};
} )( localize( withLocalizedMoment( PurchaseMeta ) ) );
