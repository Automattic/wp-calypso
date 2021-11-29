import { Gridicon } from '@automattic/components';
import { BackButton } from '@automattic/onboarding';
import { withShoppingCart } from '@automattic/shopping-cart';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import EmailVerificationGate from 'calypso/components/email-verification/email-verification-gate';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import {
	hasPlan,
	hasDomainInCart,
	domainTransfer,
	domainRegistration,
	updatePrivacyForDomain,
} from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import NewDomainsRedirectionNoticeUpsell from 'calypso/my-sites/domains/domain-management/components/domain/new-domains-redirection-notice-upsell';
import {
	domainAddEmailUpsell,
	domainMapping,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordRemoveDomainButtonClick,
} from 'calypso/state/domains/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import isSiteUpgradeable from 'calypso/state/selectors/is-site-upgradeable';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

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

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
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
			.then( () => page( domainAddEmailUpsell( this.props.selectedSiteSlug, domain ) ) );
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
						<BackButton
							className={ 'domain-search__go-back' }
							href={ domainManagementList( selectedSiteSlug ) }
						>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ translate( 'Back' ) }
						</BackButton>
						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<div className="domains__header">
							<FormattedHeader
								brandFont
								headerText={
									isManagingAllDomains
										? translate( 'All Domains' )
										: translate( 'Search for a domain' )
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
								showAlreadyOwnADomain
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
)( withCartKey( withShoppingCart( localize( DomainSearch ) ) ) );
