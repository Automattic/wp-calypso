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
import {
	hasPlan,
	hasDomainInCart,
	domainTransfer,
	domainRegistration,
	updatePrivacyForDomain,
} from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { addQueryArgs } from 'calypso/lib/url';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import DomainAndPlanPackageNavigation from 'calypso/my-sites/domains/components/domain-and-plan-package/navigation';
import NewDomainsRedirectionNoticeUpsell from 'calypso/my-sites/domains/domain-management/components/domain/new-domains-redirection-notice-upsell';
import {
	domainAddEmailUpsell,
	domainMapping,
	domainManagementList,
} from 'calypso/my-sites/domains/paths';
import { DOMAINS_WITH_PLANS_ONLY } from 'calypso/state/current-user/constants';
import { currentUserHasFlag } from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordRemoveDomainButtonClick,
} from 'calypso/state/domains/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { isDomainSidebarExperimentUser } from 'calypso/state/selectors/is-domain-sidebar-experiment-user';
import isSiteOnMonthlyPlan from 'calypso/state/selectors/is-site-on-monthly-plan';
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
		domainAndPlanUpsellFlow: PropTypes.bool,
		domainSidebarExperimentUser: PropTypes.bool,
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

	handleAddTransfer = async ( domain ) => {
		try {
			await this.props.shoppingCartManager.addProductsToCart( [ domainTransfer( { domain } ) ] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return;
		}
		this.isMounted && page( '/checkout/' + this.props.selectedSiteSlug );
	};

	componentDidMount() {
		if ( this.props.domainSidebarExperimentUser ) {
			document.body.classList.add( 'is-domain-sidebar-experiment-user' );
		}
		this.checkSiteIsUpgradeable();

		this.isMounted = true;
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable();
		}
	}

	componentWillUnmount() {
		if ( this.props.domainSidebarExperimentUser ) {
			document.body.classList.remove( 'is-domain-sidebar-experiment-user' );
		}

		this.isMounted = false;
	}

	checkSiteIsUpgradeable() {
		if ( this.props.selectedSite && ! this.props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	async addDomain( suggestion ) {
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

		if ( this.props.domainAndPlanUpsellFlow ) {
			try {
				// If we are in the domain + annual plan upsell flow, we need to redirect
				// to the plans page next and let it know that we are still in that flow.
				await this.props.shoppingCartManager.addProductsToCart( [ registration ] );
			} catch {
				// Nothing needs to be done here. CartMessages will display the error to the user.
				return;
			}
			// Monthly plans don't have free domains
			const intervalTypePath = this.props.isSiteOnMonthlyPlan ? 'yearly/' : '';
			page(
				`/plans/${ intervalTypePath }${ this.props.selectedSiteSlug }?domainAndPlanPackage=true`
			);
			return;
		}

		try {
			await this.props.shoppingCartManager.addProductsToCart( [ registration ] );
		} catch {
			// Nothing needs to be done here. CartMessages will display the error to the user.
			return;
		}
		page( domainAddEmailUpsell( this.props.selectedSiteSlug, domain ) );
	}

	removeDomain( suggestion ) {
		this.props.recordRemoveDomainButtonClick( suggestion.domain_name );

		const productToRemove = this.props.cart.products.find(
			( product ) =>
				product.meta === suggestion.domain_name && product.product_slug === suggestion.product_slug
		);
		if ( productToRemove ) {
			const uuidToRemove = productToRemove.uuid;
			this.props.shoppingCartManager.removeProductFromCart( uuidToRemove ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
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
		const {
			selectedSite,
			selectedSiteSlug,
			translate,
			isManagingAllDomains,
			cart,
			domainSidebarExperimentUser,
		} = this.props;

		if ( ! selectedSite ) {
			return null;
		}

		const classes = classnames( 'main-column', {
			'domain-search-page-wrapper': this.state.domainRegistrationAvailable,
		} );
		const { domainRegistrationMaintenanceEndTime } = this.state;

		const hasPlanInCart = hasPlan( cart );
		const hrefForDecideLater = addQueryArgs(
			{
				domainAndPlanPackage: true,
			},
			`/plans/yearly/${ selectedSiteSlug }`
		);

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
						{ ! domainSidebarExperimentUser && (
							<BackButton
								className="domain-search__go-back"
								href={ domainManagementList( selectedSiteSlug ) }
							>
								<Gridicon icon="arrow-left" size={ 18 } />
								{ translate( 'Back' ) }
							</BackButton>
						) }

						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<div className="domains__header">
							{ domainSidebarExperimentUser && (
								<>
									<DomainAndPlanPackageNavigation
										goBackLink={ `/home/${ selectedSiteSlug }` }
										step={ 1 }
									/>
									<FormattedHeader
										brandFont
										headerText={ translate( 'Claim your domain' ) }
										align="center"
									/>

									<p>
										{ translate(
											'Stake your claim on your corner of the web with a custom domain name that’s easy to find, share, and follow. Not sure yet?'
										) }
										<a className="domains__header-decide-later" href={ hrefForDecideLater }>
											{ translate( 'Decide later.' ) }
										</a>
									</p>
								</>
							) }

							{ ! domainSidebarExperimentUser && (
								<FormattedHeader
									brandFont
									headerText={
										isManagingAllDomains
											? translate( 'All Domains' )
											: translate( 'Search for a domain' )
									}
									align="left"
								/>
							) }
						</div>

						<EmailVerificationGate
							noticeText={ translate( 'You must verify your email to register new domains.' ) }
							noticeStatus="is-info"
						>
							{ ! hasPlanInCart && ! this.props.domainAndPlanUpsellFlow && (
								<NewDomainsRedirectionNoticeUpsell />
							) }
							<RegisterDomainStep
								suggestion={ this.getInitialSuggestion() }
								domainAndPlanUpsellFlow={ this.props.domainAndPlanUpsellFlow }
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
			isSiteOnMonthlyPlan: isSiteOnMonthlyPlan( state, siteId ),
			productsList: getProductsList( state ),
			userCanPurchaseGSuite: canUserPurchaseGSuite( state ),
			domainSidebarExperimentUser: isDomainSidebarExperimentUser( state ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordRemoveDomainButtonClick,
	}
)( withCartKey( withShoppingCart( localize( DomainSearch ) ) ) );
