/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import { withShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import Main from 'calypso/components/main';
import FormattedHeader from 'calypso/components/formatted-header';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { canDomainAddGSuite, getProductType } from 'calypso/lib/gsuite';
import {
	hasPlan,
	hasDomainInCart,
	domainTransfer,
	domainRegistration,
	updatePrivacyForDomain,
} from 'calypso/lib/cart-values/cart-items';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY } from 'calypso/lib/gsuite/constants';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { getProductsList } from 'calypso/state/products-list/selectors';
import {
	recordAddDomainButtonClick,
	recordRemoveDomainButtonClick,
} from 'calypso/state/domains/actions';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import NewDomainsRedirectionNoticeUpsell from 'calypso/my-sites/domains/domain-management/components/domain/new-domains-redirection-notice-upsell';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';
import { domainMapping } from 'calypso/my-sites/domains/paths';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';

/**
 * Style dependencies
 */
import './style.scss';
import 'calypso/my-sites/domains/style.scss';

class DomainSearch extends Component {
	static propTypes = {
		basePath: PropTypes.string.isRequired,
		context: PropTypes.object.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		isSiteUpgradeable: PropTypes.bool,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
	};

	isMounted = false;

	state = {
		domainRegistrationAvailable: true,
		domainRegistrationMaintenanceEndTime: null,
	};

	handleDomainsAvailabilityChange = ( isAvailable, maintenanceEndTime = null ) => {
		this.setState( {
			domainRegistrationAvailable: isAvailable,
			domainRegistrationMaintenanceEndTime: maintenanceEndTime,
		} );
	};

	handleAddRemoveDomain = ( suggestion ) => {
		if ( ! hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.addDomain( suggestion );
		} else {
			this.removeDomain( suggestion );
		}
	};

	handleAddMapping = ( domain ) => {
		const domainMappingUrl = domainMapping( this.props.selectedSiteSlug, domain );
		this.isMounted && page( domainMappingUrl );
	};

	handleAddTransfer = ( domain ) => {
		this.props.shoppingCartManager
			.addProductsToCart( [
				fillInSingleCartItemAttributes( domainTransfer( { domain } ), this.props.productsList ),
			] )
			.then( () => {
				this.isMounted && page( '/checkout/' + this.props.selectedSiteSlug );
			} );
	};

	UNSAFE_componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable( nextProps );
		}
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	componentDidMount() {
		this.isMounted = true;
	}

	checkSiteIsUpgradeable( props ) {
		if ( props.selectedSite && ! props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	addDomain( suggestion ) {
		const {
			domain_name: domain,
			product_slug: productSlug,
			supports_privacy: supportsPrivacy,
			is_premium: isPremium,
		} = suggestion;

		this.props.recordAddDomainButtonClick( domain, 'domains', isPremium );

		let registration = domainRegistration( {
			domain,
			productSlug,
			extra: { privacy_available: supportsPrivacy },
		} );

		if ( supportsPrivacy ) {
			registration = updatePrivacyForDomain( registration, true );
		}

		this.props.shoppingCartManager
			.addProductsToCart( [
				fillInSingleCartItemAttributes( registration, this.props.productsList ),
			] )
			.then( () => {
				if ( this.props.userCanPurchaseGSuite && canDomainAddGSuite( domain ) ) {
					page(
						'/domains/add/' +
							domain +
							'/' +
							getProductType( GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ) +
							'/' +
							this.props.selectedSiteSlug
					);
				} else {
					page( '/checkout/' + this.props.selectedSiteSlug );
				}
			} );
	}

	removeDomain( suggestion ) {
		this.props.recordRemoveDomainButtonClick( suggestion.domain_name );

		const productToRemove = this.props.cart.products.find(
			( product ) =>
				product.meta === suggestion.domain_name && product.product_slug === suggestion.product_slug
		);
		if ( productToRemove ) {
			const uuidToRemove = productToRemove.uuid;
			this.props.shoppingCartManager.removeProductFromCart( uuidToRemove );
		}
	}

	getInitialSuggestion() {
		const { context, selectedSite } = this.props;
		if ( context.query.suggestion ) {
			return context.query.suggestion;
		}

		const wpcomSubdomainWithRandomNumberSuffix = /^(.+?)([0-9]{5,})\.wordpress\.com$/i;
		const [ , strippedHostname ] =
			selectedSite.domain.match( wpcomSubdomainWithRandomNumberSuffix ) || [];
		return strippedHostname ?? selectedSite.domain.split( '.' )[ 0 ];
	}

	render() {
		const { selectedSite, selectedSiteSlug, translate, isManagingAllDomains, cart } = this.props;

		if ( ! selectedSite ) {
			return null;
		}

		const classes = classnames( 'main-column', {
			'domain-search-page-wrapper': this.state.domainRegistrationAvailable,
		} );
		const { domainRegistrationMaintenanceEndTime } = this.state;

		const hasPlanInCart = hasPlan( cart );

		let content;

		if ( ! this.state.domainRegistrationAvailable ) {
			let maintenanceEndTime = translate( 'shortly', {
				comment: 'If a specific maintenance end time is unavailable, we will show this instead.',
			} );
			if ( domainRegistrationMaintenanceEndTime ) {
				maintenanceEndTime = moment.unix( domainRegistrationMaintenanceEndTime ).fromNow();
			}

			content = (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate( 'Domain registration is unavailable' ) }
					line={ translate( "We're hard at work on the issue. Please check back %(timePeriod)s.", {
						args: {
							timePeriod: maintenanceEndTime,
						},
					} ) }
					action={ translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSiteSlug }
				/>
			);
		} else {
			content = (
				<span>
					<div className="domain-search__content">
						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<div className="domains__header">
							<FormattedHeader
								brandFont
								headerText={
									isManagingAllDomains ? translate( 'All Domains' ) : translate( 'Site Domains' )
								}
								align="left"
							/>
							{ ! isManagingAllDomains /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ && (
								<div className="domains__header-buttons">
									<HeaderCart
										selectedSite={ this.props.selectedSite }
										currentRoute={ this.props.currentRoute }
									/>
								</div>
							) }
						</div>

						<EmailVerificationGate
							noticeText={ translate( 'You must verify your email to register new domains.' ) }
							noticeStatus="is-info"
						>
							{ ! hasPlanInCart && <NewDomainsRedirectionNoticeUpsell /> }
							<RegisterDomainStep
								suggestion={ this.getInitialSuggestion() }
								domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
								onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
								onAddDomain={ this.handleAddRemoveDomain }
								onAddMapping={ this.handleAddMapping }
								onAddTransfer={ this.handleAddTransfer }
								isCartPendingUpdate={ this.props.shoppingCartManager.isPendingUpdate }
								offerUnavailableOption
								selectedSite={ selectedSite }
								basePath={ this.props.basePath }
								products={ this.props.productsList }
								vendor={ getSuggestionsVendor() }
							/>
						</EmailVerificationGate>
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes } wideLayout>
				<QueryProductsList />
				<QuerySiteDomains siteId={ this.props.selectedSiteId } />
				<SidebarNavigation />
				{ content }
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			domains: getDomainsBySiteId( state, siteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId: siteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
			isSiteUpgradeable: isSiteUpgradeable( state, siteId ),
			productsList: getProductsList( state ),
			userCanPurchaseGSuite: canUserPurchaseGSuite( state ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordRemoveDomainButtonClick,
	}
)( withShoppingCart( localize( DomainSearch ) ) );
