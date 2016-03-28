/**
 * External Dependencies
 */
import classNames from 'classnames';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'analytics';
import Button from 'components/button';
import Card from 'components/card';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import config from 'config';
import {
	creditCardExpiresBeforeSubscription,
	getName,
	hasPaymentMethod,
	hasPrivateRegistration,
	isCancelable,
	isExpired,
	isExpiring,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	isRedeemable,
	isRefundable,
	isRenewable,
	isRenewing,
	paymentLogoType,
	purchaseType,
	showCreditCardExpiringWarning
} from 'lib/purchases';
import { domainManagementEdit } from 'my-sites/upgrades/paths';
import { getDetailsUrl as getThemeDetailsUrl } from 'my-sites/themes/helpers';
import { getPurchase, getSelectedSite, goToList, recordPageView } from '../utils';
import { googleAppsSettingsUrl } from 'lib/google-apps';
import HeaderCake from 'components/header-cake';
import { isDomainProduct, isDomainRegistration, isGoogleApps, isPlan, isSiteRedirect, isTheme } from 'lib/products-values';
import Main from 'components/main';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import paths from '../paths';
import PaymentLogo from 'components/payment-logo';
import RemovePurchase from '../remove-purchase';
import supportPaths from 'lib/url/support';
import titles from 'me/purchases/titles';
import VerticalNavItem from 'components/vertical-nav/item';
import * as upgradesActions from 'lib/upgrades/actions';

function canEditPaymentDetails( purchase ) {
	return config.isEnabled( 'upgrades/credit-cards' ) && ! isExpired( purchase ) && ! isOneTimePurchase( purchase ) && ! isIncludedWithPlan( purchase );
}

/**
 * Determines if data is being fetched. This is different than `isDataLoading` in `PurchasesUtils`
 * because this page can be rendered without a selected site.
 *
 * @param {object} props The props passed to `ManagePurchase`
 * @return {boolean} Whether or not the data is loading
 */
function isDataLoading( props ) {
	return ! props.hasLoadedSites || ! props.selectedPurchase.hasLoadedFromServer;
}

const ManagePurchase = React.createClass( {
	propTypes: {
		destinationType: React.PropTypes.string,
		hasLoadedSites: React.PropTypes.bool.isRequired,
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
			React.PropTypes.undefined
		] ),
		user: React.PropTypes.object.isRequired
	},

	componentWillMount() {
		if ( ! this.isDataValid() ) {
			page.redirect( paths.list() );
			return;
		}

		recordPageView( 'manage', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			page.redirect( paths.list() );
			return;
		}

		recordPageView( 'manage', this.props, nextProps );
	},

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		return Boolean( getPurchase( props ) );
	},

	renderNotices() {
		if ( isDataLoading( this.props ) ) {
			return null;
		}

		return this.renderPurchaseExpiringNotice() || this.renderCreditCardExpiringNotice();
	},

	renderContactSupportToRenewMessage() {
		const purchase = getPurchase( this.props );

		if ( getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<div className="manage-purchase__contact-support">
				{ this.translate( '{{strong}}Looking to renew?{{/strong}} Please {{contactSupportLink}}contact support{{/contactSupportLink}} to renew %(purchaseName)s.', {
					args: {
						purchaseName: getName( purchase )
					},
					components: {
						strong: <strong />,
						contactSupportLink: <a href={ supportPaths.CONTACT } />
					}
				} ) }
			</div>
		);
	},

	renderPurchaseExpiringNotice() {
		const purchase = getPurchase( this.props );
		let noticeStatus = 'is-info';

		if ( ! isExpiring( purchase ) ) {
			return null;
		}

		if ( purchase.expiryMoment < this.moment().add( 90, 'days' ) ) {
			noticeStatus = 'is-error';
		}

		return (
			<Notice
				className="manage-purchase__purchase-expiring-notice"
				showDismiss={ false }
				status={ noticeStatus }
				text={ this.translate( '%(purchaseName)s will expire and be removed from your site %(expiry)s.',
					{
						args: {
							purchaseName: getName( purchase ),
							expiry: this.moment( purchase.expiryMoment ).fromNow()
						}
					}
				) }>
				{ this.renderRenewNoticeAction() }
			</Notice>
		);
	},

	renderRenewNoticeAction() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<NoticeAction onClick={ this.handleRenew }>
				{ this.translate( 'Renew Now' ) }
			</NoticeAction>
		);
	},

	renderCreditCardExpiringNotice() {
		const purchase = getPurchase( this.props ),
			{ id, payment: { creditCard } } = purchase;

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
						this.translate( 'Your %(cardType)s ending in %(cardNumber)d expires %(cardExpiry)s – before the next renewal. ' +
							'Please {{a}}update your payment information{{/a}}.', {
								args: {
									cardType: creditCard.type.toUpperCase(),
									cardNumber: creditCard.number,
									cardExpiry: creditCard.expiryMoment.format( 'MMMM YYYY' )
								},
								components: {
									a: canEditPaymentDetails( purchase )
										? <a href={ paths.editCardDetails( this.props.selectedSite.slug, id, creditCard.id ) } />
										: <span />
								}
							}
						)
					}
				</Notice>
			);
		}
	},

	renderPathNotice() {
		if ( isDataLoading( this.props ) || ! this.props.destinationType ) {
			return;
		}

		const purchase = getPurchase( this.props );
		let text;

		if ( 'thank-you' === this.props.destinationType ) {
			text = this.translate( '%(purchaseName)s has been renewed and will now auto renew in the future. {{a}}Learn more{{/a}}', {
				args: {
					purchaseName: getName( purchase )
				},
				components: {
					a: <a href="https://support.wordpress.com/auto-renewal/" target="_blank" />
				}
			} );
		}

		if ( 'canceled-private-registration' === this.props.destinationType ) {
			text = this.translate( 'You have successfully canceled private registration for %(domain)s.', {
				args: {
					domain: purchase.meta
				}
			} );
		}

		return (
			<Notice
				className="manage-purchase__path-notice"
				showDismiss={ false }
				status="is-success">
				{ text }
			</Notice>
		);
	},

	handleRenew() {
		const purchase = getPurchase( this.props ),
			renewItem = cartItems.getRenewalItemFromProduct( purchase, {
				domain: purchase.meta
			} ),
			renewItems = [ renewItem ];

		// Track the renew now submit
		analytics.tracks.recordEvent(
			'calypso_purchases_renew_now_click',
			{ product_slug: purchase.productSlug }
		);

		if ( hasPrivateRegistration( purchase ) ) {
			const privacyItem = cartItems.getRenewalItemFromCartItem( cartItems.domainPrivacyProtection( {
				domain: purchase.meta
			} ), {
				id: purchase.id,
				domain: purchase.domain
			} );

			renewItems.push( privacyItem );
		}

		if ( isRedeemable( purchase ) ) {
			const redemptionItem = cartItems.getRenewalItemFromCartItem( cartItems.domainRedemption( {
				domain: purchase.meta
			} ), {
				id: purchase.id,
				domain: purchase.domain
			} );

			renewItems.push( redemptionItem );
		}

		upgradesActions.addItems( renewItems );

		page( '/checkout/' + this.props.selectedSite.slug );
	},

	renderPrice() {
		const purchase = getPurchase( this.props ),
			{ amount, currencyCode, currencySymbol } = purchase;

		if ( isOneTimePurchase( purchase ) ) {
			return this.translate( '%(currencySymbol)s%(amount)d %(currencyCode)s {{period}}(one-time){{/period}}', {
				args: { amount, currencyCode, currencySymbol },
				components: {
					period: <span className="manage-purchase__time-period" />
				}
			} );
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return this.translate( 'Free with Plan' );
		}

		return this.translate( '%(currencySymbol)s%(amount)d %(currencyCode)s {{period}}/ year{{/period}}', {
			args: { amount, currencyCode, currencySymbol },
			components: {
				period: <span className="manage-purchase__time-period" />
			}
		} );
	},

	renderProductLink() {
		const selectedSite = getSelectedSite( this.props ),
			purchase = getPurchase( this.props );
		let url, text;

		if ( ! selectedSite ) {
			return null;
		}

		if ( isPlan( purchase ) ) {
			url = '/plans/compare';
			text = this.translate( 'View Plan Features' );
		}

		if ( isDomainProduct( purchase ) || isSiteRedirect( purchase ) ) {
			url = domainManagementEdit( selectedSite.slug, purchase.meta );
			text = this.translate( 'Domain Settings' );
		}

		if ( isGoogleApps( purchase ) ) {
			url = googleAppsSettingsUrl( purchase.meta );
			text = this.translate( 'Google Apps Settings' );
		}

		if ( isTheme( purchase ) ) {
			url = getThemeDetailsUrl( { id: purchase.meta }, { slug: purchase.domain } );
			text = this.translate( 'Theme Details' );
		}

		if ( url && text ) {
			return (
				<a href={ url }>
					{ text }
				</a>
			);
		}

		return null;
	},

	renderPaymentInfo() {
		const purchase = getPurchase( this.props );

		if ( isDataLoading( this.props ) ) {
			return <span className="manage-purchase__content manage-purchase__detail" />;
		}

		if ( isIncludedWithPlan( purchase ) ) {
			return (
				<span className="manage-purchase__content manage-purchase__detail">
					{ this.translate( 'Included with plan' ) }
				</span>
			);
		}

		if ( hasPaymentMethod( purchase ) ) {
			let paymentInfo = null;

			if ( isPaidWithCreditCard( purchase ) ) {
				paymentInfo = purchase.payment.creditCard.number;
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
				{ this.translate( 'None' ) }
			</span>
		);
	},

	renderPaymentDetails() {
		const purchase = getPurchase( this.props );

		if ( ! isDataLoading( this.props ) && isOneTimePurchase( purchase ) ) {
			return null;
		}

		let paymentDetails = (
			<span>
				<em className="manage-purchase__content manage-purchase__detail-label">
					{ isDataLoading( this.props ) ? null : this.translate( 'Payment method' ) }
				</em>
				{ this.renderPaymentInfo() }
			</span>
		);

		if ( isDataLoading( this.props ) || ! canEditPaymentDetails( purchase ) || ! isPaidWithCreditCard( purchase ) || ! getSelectedSite( this.props ) ) {
			return (
				<li>
					{ paymentDetails }
				</li>
			);
		}

		const { id, payment: { creditCard } } = purchase;

		return (
			<li>
				<a href={ paths.editCardDetails( this.props.selectedSite.slug, id, creditCard.id ) }>
					{ paymentDetails }
				</a>
			</li>
		);
	},

	renderRenewButton() {
		const purchase = getPurchase( this.props );

		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! isRenewable( purchase ) || isExpired( purchase ) || isExpiring( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<Button className="manage-purchase__renew-button" onClick={ this.handleRenew } compact>{ this.translate( 'Renew Now' ) }</Button>
		);
	},

	renderExpiredRenewNotice() {
		const purchase = getPurchase( this.props );

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
				text={ this.translate( 'This purchase has expired and is no longer in use.' ) }>
				{ this.renderRenewNoticeAction() }
			</Notice>
		);
	},

	renderRenewsOrExpiresOnLabel() {
		const purchase = getPurchase( this.props );

		if ( isExpiring( purchase ) || creditCardExpiresBeforeSubscription( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				return this.translate( 'Domain expires on' );
			}

			return this.translate( 'Subscription expires on' );
		}

		if ( isExpired( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				return this.translate( 'Domain expired on' );
			}

			return this.translate( 'Subscription expired on' );
		}

		if ( isDomainRegistration( purchase ) ) {
			return this.translate( 'Domain auto-renews on' );
		}

		return this.translate( 'Subscription auto-renews on' );
	},

	renderRenewsOrExpiresOn() {
		const purchase = getPurchase( this.props );

		if ( isIncludedWithPlan( purchase ) ) {
			const attachedPlanUrl = paths.managePurchase(
				this.props.selectedSite.slug,
				purchase.attachedToPurchaseId
			);

			return (
				<span>
					{ this.translate( 'Renews with Plan' ) }
					<a href={ attachedPlanUrl }>
						{ this.translate( 'View Plan' ) }
					</a>
				</span>
			);
		}

		if ( isRenewing( purchase ) ) {
			return this.moment( purchase.renewDate ).format( 'LL' );
		}

		if ( isExpiring( purchase ) || isExpired( purchase ) || creditCardExpiresBeforeSubscription( purchase ) ) {
			return this.moment( purchase.expiryDate ).format( 'LL' );
		}

		if ( isOneTimePurchase( purchase ) ) {
			return this.translate( 'Never Expires' );
		}
	},

	renderEditPaymentMethodNavItem() {
		const purchase = getPurchase( this.props ),
			{ id, payment } = purchase;

		if ( ! getSelectedSite( this.props ) ) {
			return null;
		}

		let path = paths.editCardDetails( this.props.selectedSite.slug, id );
		if ( isPaidWithCreditCard( purchase ) ) {
			path = paths.editSpecificCardDetails( this.props.selectedSite.slug, id, payment.creditCard.id );
		}

		if ( canEditPaymentDetails( purchase ) ) {
			return (
				<CompactCard href={ path }>
					{ this.translate( 'Edit Payment Method' ) }
				</CompactCard>
			);
		}

		return null;
	},

	renderCancelPurchaseNavItem() {
		const purchase = getPurchase( this.props ),
			{ id } = purchase;

		if ( ! isCancelable( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		let text;

		if ( isRefundable( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				text = this.translate( 'Cancel Domain and Refund' );
			} else {
				text = this.translate( 'Cancel Subscription and Refund' );
			}
		} else if ( isDomainRegistration( purchase ) ) {
			text = this.translate( 'Cancel Domain' );
		} else {
			text = this.translate( 'Cancel Subscription' );
		}

		return (
			<CompactCard href={ paths.cancelPurchase( this.props.selectedSite.slug, id ) }>
				{ text }
			</CompactCard>
		);
	},

	renderCancelPrivateRegistration() {
		const purchase = getPurchase( this.props ),
			{ id } = purchase;

		if ( isExpired( purchase ) || ! hasPrivateRegistration( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<CompactCard href={ paths.cancelPrivateRegistration( this.props.selectedSite.slug, id ) }>
				{ this.translate( 'Cancel Private Registration' ) }
			</CompactCard>
		);
	},

	renderPurchaseDetail() {
		let classes,
			purchase,
			purchaseTypeSeparator,
			purchaseTitleText,
			purchaseTypeText,
			siteName,
			siteDomain,
			productLink,
			price,
			renewsOrExpiresOnLabel,
			renewsOrExpiresOn,
			renewButton,
			expiredRenewNotice,
			editPaymentMethodNavItem,
			cancelPurchaseNavItem,
			cancelPrivateRegistrationNavItem,
			contactSupportToRenewMessage;

		if ( isDataLoading( this.props ) ) {
			classes = 'manage-purchase__info is-placeholder';
			editPaymentMethodNavItem = <VerticalNavItem isPlaceholder />;
			cancelPurchaseNavItem = <VerticalNavItem isPlaceholder />;
		} else {
			purchase = getPurchase( this.props );
			classes = classNames( 'manage-purchase__info', {
				'is-expired': purchase && isExpired( purchase )
			} );
			purchaseTypeSeparator = purchaseType( purchase ) ? '|' : '';
			purchaseTitleText = getName( purchase );
			purchaseTypeText = purchaseType( purchase );
			siteName = purchase.siteName;
			siteDomain = purchase.domain;
			productLink = this.renderProductLink();
			price = this.renderPrice();
			renewsOrExpiresOnLabel = this.renderRenewsOrExpiresOnLabel();
			renewsOrExpiresOn = this.renderRenewsOrExpiresOn();
			renewButton = this.renderRenewButton();
			contactSupportToRenewMessage = this.renderContactSupportToRenewMessage();
			expiredRenewNotice = this.renderExpiredRenewNotice();
			editPaymentMethodNavItem = this.renderEditPaymentMethodNavItem();
			cancelPurchaseNavItem = this.renderCancelPurchaseNavItem();
			cancelPrivateRegistrationNavItem = this.renderCancelPrivateRegistration();
		}

		return (
			<div>
				<Card className={ classes }>
					<header className="manage-purchase__header">
						<strong className="manage-purchase__content manage-purchase__title">{ purchaseTitleText }</strong>
						<span className="manage-purchase__content manage-purchase__subtitle">
							{ purchaseTypeText } { purchaseTypeSeparator } { siteName ? siteName : siteDomain }
						</span>
						<span className="manage-purchase__content manage-purchase__settings-link">
							{ productLink }
						</span>
					</header>

					<ul className="manage-purchase__meta">
						<li>
							<em className="manage-purchase__content manage-purchase__detail-label">
								{ isDataLoading( this.props ) ? null : this.translate( 'Price' ) }
							</em>
							<span className="manage-purchase__content manage-purchase__detail">{ price }</span>
						</li>
						<li>
							<em className="manage-purchase__content manage-purchase__detail-label">{ renewsOrExpiresOnLabel }</em>
							<span className="manage-purchase__content manage-purchase__detail">
								{ renewsOrExpiresOn }
							</span>
						</li>
						{ this.renderPaymentDetails() }
					</ul>

					{ renewButton }
					{ contactSupportToRenewMessage }
				</Card>

				{ expiredRenewNotice }
				{ editPaymentMethodNavItem }
				{ cancelPurchaseNavItem }
				{ cancelPrivateRegistrationNavItem }

				<RemovePurchase
					selectedSite={ this.props.selectedSite }
					selectedPurchase={ this.props.selectedPurchase }
					user={ this.props.user } />
			</div>
		);
	},

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}

		return (
			<span>
				{ this.renderPathNotice() }
				<Main className="manage-purchase">
					<HeaderCake onClick={ goToList }>
						{ titles.managePurchase }
					</HeaderCake>
					{ this.renderNotices() }
					{ this.renderPurchaseDetail() }
				</Main>
			</span>
		);
	}
} );

export default ManagePurchase;
