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
import { domainManagementEdit } from 'my-sites/upgrades/paths';
import { googleAppsSettingsUrl } from 'lib/google-apps';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import NoticeAction from 'components/notice/notice-action';
import { oldShowcaseUrl } from 'lib/themes/helpers';
import paths from '../paths';
import PaymentLogo from 'components/payment-logo';
import Notice from 'components/notice';
import titles from 'me/purchases/titles';
import VerticalNavItem from 'components/vertical-nav/item';
import * as upgradesActions from 'lib/upgrades/actions';
import {
	creditCardExpiresBeforeSubscription,
	getName,
	hasPaymentMethod,
	hasPrivateRegistration,
	isCancelable,
	isExpired,
	isExpiring,
	isPaidWithCreditCard,
	isRedeemable,
	isRefundable,
	isRemovable,
	isRenewable,
	isRenewing,
	isIncludedWithPlan,
	isOneTimePurchase,
	paymentLogoType,
	purchaseType,
	showCreditCardExpiringWarning,
	showEditPaymentDetails
} from 'lib/purchases';
import { getPurchase, getSelectedSite, goToList, isDataLoading, recordPageView } from '../utils';
import { isDomainProduct, isGoogleApps, isPlan, isSiteRedirect, isTheme } from 'lib/products-values';

const ManagePurchase = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		destinationType: React.PropTypes.string
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

	isDataFetchingAfterRenewal() {
		return 'thank-you' === this.props.destinationType && this.props.selectedPurchase.isFetching;
	},

	isDataValid( props = this.props ) {
		if ( isDataLoading( props ) ) {
			return true;
		}

		return getSelectedSite( props ) && getPurchase( props );
	},

	renderNotices() {
		if ( isDataLoading( this.props ) || this.isDataFetchingAfterRenewal() ) {
			return null;
		}

		return this.renderPurchaseExpiringNotice() || this.renderCreditCardExpiringNotice();
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
				<NoticeAction onClick={ this.handleRenew }>
					{ this.translate( 'Renew Now' ) }
				</NoticeAction>
			</Notice>
		);
	},

	renderCreditCardExpiringNotice() {
		const purchase = getPurchase( this.props ),
			{ id, payment: { creditCard } } = purchase;

		if ( isExpired( purchase ) || isOneTimePurchase( purchase ) || isIncludedWithPlan( purchase ) ) {
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
									a: <a href={ paths.editCardDetails( this.props.selectedSite.slug, id, creditCard.id ) } />
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
			cartItem = cartItems.getRenewalItemFromProduct( purchase, {
				domain: purchase.meta
			} );

		// Track the renew now submit
		analytics.tracks.recordEvent(
			'calypso_purchases_renew_now_click',
			{ product_slug: purchase.productSlug }
		);

		upgradesActions.addItem( cartItem );

		if ( hasPrivateRegistration( purchase ) ) {
			const privacyItem = cartItems.getRenewalItemFromCartItem( cartItems.domainPrivacyProtection( {
				domain: purchase.meta
			} ), {
				id: purchase.id,
				domain: purchase.domain
			} );

			upgradesActions.addItem( privacyItem );
		}

		if ( isRedeemable( purchase ) ) {
			const redemptionItem = cartItems.getRenewalItemFromCartItem( cartItems.domainRedemption( {
				domain: purchase.meta
			} ), {
				id: purchase.id,
				domain: purchase.domain
			} );

			upgradesActions.addItem( redemptionItem );
		}

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
		const { selectedSite } = this.props,
			purchase = getPurchase( this.props );
		let url, text;

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
			url = oldShowcaseUrl + purchase.domain + '/' + purchase.meta;
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

		if ( isDataLoading( this.props ) || this.isDataFetchingAfterRenewal() ) {
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
		const purchase = getPurchase( this.props ),
			isLoading = isDataLoading( this.props ) || this.isDataFetchingAfterRenewal();

		if ( ! isLoading && isOneTimePurchase( purchase ) ) {
			return null;
		}

		let paymentDetails = (
			<span>
				<em className="manage-purchase__content manage-purchase__detail-label">
					{ isLoading ? null : this.translate( 'Payment method' ) }
				</em>
				{ this.renderPaymentInfo() }
			</span>
		);

		if ( isLoading || ! showEditPaymentDetails( purchase ) ) {
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

		if ( ! isRenewable( purchase ) || isExpired( purchase ) || isExpiring( purchase ) ) {
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
				<NoticeAction onClick={ this.handleRenew }>
					{ this.translate( 'Renew Now' ) }
				</NoticeAction>
			</Notice>
		);
	},

	renderRenewsOrExpiresOnLabel() {
		const purchase = getPurchase( this.props );

		if ( isExpiring( purchase ) || creditCardExpiresBeforeSubscription( purchase ) ) {
			return this.translate( 'Expires on' );
		}

		if ( isExpired( purchase ) ) {
			return this.translate( 'Expired on' );
		}

		return this.translate( 'Auto-renews on' );
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

	renderRemovePurchaseInformation() {
		const purchase = getPurchase( this.props ),
			contactSupportUrl = 'https://support.wordpress.com/contact/';

		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		return (
			<div className="manage-purchase__remove-box">
				<em className="manage-purchase__content manage-purchase__remove-text">{ this.translate(
					'{{strong}}Looking to remove this purchase?{{/strong}} Please {{a}}contact support{{/a}} to remove %(purchaseName)s from your account.',
					{
						args: {
							purchaseName: getName( purchase )
						},
						components: {
							a: <a href={ contactSupportUrl } target="_blank" />,
							strong: <strong />
						}
					}
				) }</em>
			</div>
		);
	},

	renderEditPaymentMethodNavItem() {
		const purchase = getPurchase( this.props ),
			{ id, payment } = purchase;

		if ( showEditPaymentDetails( purchase ) ) {
			return (
				<VerticalNavItem path={ paths.editCardDetails( this.props.selectedSite.slug, id, payment.creditCard.id ) }>
					{ this.translate( 'Edit Payment Method' ) }
				</VerticalNavItem>
			);
		}

		return null
	},

	renderCancelPurchaseNavItem() {
		const purchase = getPurchase( this.props ),
			{ id } = purchase;

		if ( ! isCancelable( purchase ) ) {
			return null;
		}

		const translateArgs = {
			args: { purchaseName: getName( purchase ) }
		};

		return (
			<VerticalNavItem path={ paths.cancelPurchase( this.props.selectedSite.slug, id ) }>
				{
					isRefundable( purchase )
					? this.translate( 'Cancel and Refund %(purchaseName)s', translateArgs )
					: this.translate( 'Cancel %(purchaseName)s', translateArgs )
				}
			</VerticalNavItem>
		);
	},

	renderCancelPrivateRegistration() {
		const purchase = getPurchase( this.props ),
			{ id } = purchase;

		if ( isExpired( purchase ) || ! hasPrivateRegistration( purchase ) ) {
			return null;
		}

		return (
			<VerticalNavItem path={ paths.cancelPrivateRegistration( this.props.selectedSite.slug, id ) }>
				{ this.translate( 'Cancel Private Registration' ) }
			</VerticalNavItem>
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
			removePurchaseInformation,
			renewButton,
			expiredRenewNotice,
			editPaymentMethodNavItem,
			cancelPurchaseNavItem,
			cancelPrivateRegistrationNavItem;

		if ( isDataLoading( this.props ) || this.isDataFetchingAfterRenewal() ) {
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
			removePurchaseInformation = this.renderRemovePurchaseInformation();
			renewButton = this.renderRenewButton();
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
					{ removePurchaseInformation }
					{ renewButton }
				</Card>

				{ expiredRenewNotice }

				{ editPaymentMethodNavItem }
				{ cancelPurchaseNavItem }
				{ cancelPrivateRegistrationNavItem }
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
