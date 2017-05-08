/**
 * External Dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
import { cartItems } from 'lib/cart-values';
import CompactCard from 'components/card/compact';
import config from 'config';
import {
	getName,
	hasPrivacyProtection,
	isCancelable,
	isExpired,
	isExpiring,
	isOneTimePurchase,
	isRedeemable,
	isRefundable,
	isRenewable,
	isRenewal,
	isRenewing,
	isSubscription,
	purchaseType,
} from 'lib/purchases';
import {
	canEditPaymentDetails,
	isDataLoading,
	getEditCardDetailsPath,
	getPurchase,
	getSelectedSite,
	goToList,
	recordPageView
} from '../utils';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import {
	getSelectedSite as getSelectedSiteSelector,
	getSelectedSiteId,
} from 'state/ui/selectors';
import HeaderCake from 'components/header-cake';
import { isDomainRegistration } from 'lib/products-values';
import { isRequestingSites } from 'state/sites/selectors';
import Main from 'components/main';
import PurchasePlanDetails from './plan-details';
import ProductLink from 'me/purchases/product-link';
import PurchaseMeta from './purchase-meta';
import PurchaseNotice from './notices';
import PurchaseSiteHeader from '../purchases-site/header';
import QueryUserPurchases from 'components/data/query-user-purchases';
import RemovePurchase from '../remove-purchase';
import VerticalNavItem from 'components/vertical-nav/item';
import paths from '../paths';
import support from 'lib/url/support';
import titles from 'me/purchases/titles';
import userFactory from 'lib/user';
import * as upgradesActions from 'lib/upgrades/actions';

const user = userFactory();

const ManagePurchase = React.createClass( {
	propTypes: {
		destinationType: React.PropTypes.string,
		hasLoadedSites: React.PropTypes.bool.isRequired,
		hasLoadedUserPurchasesFromServer: React.PropTypes.bool.isRequired,
		selectedPurchase: React.PropTypes.object,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool,
			React.PropTypes.undefined
		] )
	},

	componentWillMount() {
		if ( ! this.isDataValid() ) {
			page.redirect( paths.purchasesRoot() );
			return;
		}

		recordPageView( 'manage', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.isDataValid() && ! this.isDataValid( nextProps ) ) {
			page.redirect( paths.purchasesRoot() );
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

		if ( hasPrivacyProtection( purchase ) ) {
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

	renderRenewButton() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! isRenewable( purchase ) || isExpired( purchase ) || isExpiring( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<Button className="manage-purchase__renew-button" onClick={ this.handleRenew } compact>
				{ translate( 'Renew Now' ) }
			</Button>
		);
	},

	renderPlanDetails() {
		if ( ! config.isEnabled( 'me/purchases-v2' ) ) {
			return null;
		}

		return (
			<PurchasePlanDetails
				selectedSite={ this.props.selectedSite }
				purchaseId={ this.props.purchaseId }
			/>
		);
	},

	renderEditPaymentMethodNavItem() {
		const purchase = getPurchase( this.props );
		const { translate } = this.props;

		if ( ! getSelectedSite( this.props ) ) {
			return null;
		}

		if ( canEditPaymentDetails( purchase ) ) {
			const path = getEditCardDetailsPath( this.props.selectedSite, purchase );

			const text = isRenewing( purchase )
				? translate( 'Edit Payment Method' )
				: translate( 'Add Credit Card' );

			return (
				<CompactCard href={ path }>{ text }</CompactCard>
			);
		}

		return null;
	},

	renderCancelPurchaseNavItem() {
		const purchase = getPurchase( this.props ),
			{ id } = purchase;
		const { translate } = this.props;

		if ( ! isCancelable( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		let text, link = paths.cancelPurchase( this.props.selectedSite.slug, id );

		if ( isRefundable( purchase ) ) {
			if ( isDomainRegistration( purchase ) ) {
				if ( isRenewal( purchase ) ) {
					text = translate( 'Contact Support to Cancel Domain and Refund' );
					link = support.CALYPSO_CONTACT;
				} else {
					text = translate( 'Cancel Domain and Refund' );
				}
			}

			if ( isSubscription( purchase ) ) {
				text = translate( 'Cancel Subscription and Refund' );
			}

			if ( isOneTimePurchase( purchase ) ) {
				text = translate( 'Cancel and Refund' );
			}
		} else {
			if ( isDomainRegistration( purchase ) ) {
				text = translate( 'Cancel Domain' );
			}

			if ( isSubscription( purchase ) ) {
				text = translate( 'Cancel Subscription' );
			}
		}

		return (
			<CompactCard href={ link }>
				{ text }
			</CompactCard>
		);
	},

	renderCancelPrivacyProtection() {
		const purchase = getPurchase( this.props ),
			{ id } = purchase;
		const { translate } = this.props;

		if ( isExpired( purchase ) || ! hasPrivacyProtection( purchase ) || ! getSelectedSite( this.props ) ) {
			return null;
		}

		return (
			<CompactCard href={ paths.cancelPrivacyProtection( this.props.selectedSite.slug, id ) }>
				{ translate( 'Cancel Privacy Protection' ) }
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
			renewButton,
			editPaymentMethodNavItem,
			cancelPurchaseNavItem,
			cancelPrivacyProtectionNavItem;

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
			productLink = (
				<ProductLink selectedPurchase={ purchase } selectedSite={ this.props.selectedSite } />
			);
			renewButton = this.renderRenewButton();
			editPaymentMethodNavItem = this.renderEditPaymentMethodNavItem();
			cancelPurchaseNavItem = this.renderCancelPurchaseNavItem();
			cancelPrivacyProtectionNavItem = this.renderCancelPrivacyProtection();
		}

		return (
			<div>
				<PurchaseSiteHeader
					siteId={ this.props.selectedSiteId }
					name={ siteName }
					domain={ siteDomain }
					isPlaceholder={ isDataLoading( this.props ) } />
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

					<PurchaseMeta purchaseId={ isDataLoading( this.props ) ? false : this.props.selectedPurchase.id } />

					{ renewButton }
				</Card>

				{ this.renderPlanDetails() }

				{ editPaymentMethodNavItem }
				{ cancelPurchaseNavItem }
				{ cancelPrivacyProtectionNavItem }

				<RemovePurchase
					hasLoadedSites={ this.props.hasLoadedSites }
					hasLoadedUserPurchasesFromServer={ this.props.hasLoadedUserPurchasesFromServer }
					selectedSite={ this.props.selectedSite }
					selectedPurchase={ this.props.selectedPurchase }
				/>
			</div>
		);
	},

	render() {
		if ( ! this.isDataValid() ) {
			return null;
		}
		const { selectedSite, selectedPurchase } = this.props;
		let editCardDetailsPath;
		if ( ! isDataLoading( this.props ) && selectedSite ) {
			editCardDetailsPath = canEditPaymentDetails( selectedPurchase ) && getEditCardDetailsPath( selectedSite, selectedPurchase );
		}

		return (
			<span>
				<QueryUserPurchases userId={ user.get().ID } />
				<Main className="manage-purchase">
					<HeaderCake onClick={ goToList }>
						{ titles.managePurchase }
					</HeaderCake>
					<PurchaseNotice
						isDataLoading={ isDataLoading( this.props ) }
						handleRenew={ this.handleRenew }
						selectedSite={ selectedSite }
						selectedPurchase={ selectedPurchase }
						editCardDetailsPath={ editCardDetailsPath } />
					{ this.renderPurchaseDetail() }
				</Main>
			</span>
		);
	}
} );

export default connect(
	( state, props ) => ( {
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase: getByPurchaseId( state, props.purchaseId ),
		selectedSite: getSelectedSiteSelector( state ),
		selectedSiteId: getSelectedSiteId( state ),
	} )
)( localize( ManagePurchase ) );
