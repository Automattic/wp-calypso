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
import { addItem, removeItem } from 'calypso/lib/cart/actions';
import { canDomainAddGSuite } from 'calypso/lib/gsuite';
import {
	hasPlan,
	hasDomainInCart,
	domainMapping,
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
		hasPlanInCart: PropTypes.bool,
		isSiteUpgradeable: PropTypes.bool,
		productsList: PropTypes.object.isRequired,
		selectedSite: PropTypes.object,
		selectedSiteId: PropTypes.number,
		selectedSiteSlug: PropTypes.string,
	};

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
		addItem( domainMapping( { domain } ) );
		page( '/checkout/' + this.props.selectedSiteSlug );
	};

	handleAddTransfer = ( domain ) => {
		addItem( domainTransfer( { domain } ) );
		page( '/checkout/' + this.props.selectedSiteSlug );
	};

	UNSAFE_componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.selectedSiteId !== this.props.selectedSiteId ) {
			this.checkSiteIsUpgradeable( nextProps );
		}
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

		addItem( registration );

		if ( canDomainAddGSuite( domain ) ) {
			page( '/domains/add/' + domain + '/google-apps/' + this.props.selectedSiteSlug );
		} else {
			page( '/checkout/' + this.props.selectedSiteSlug );
		}
	}

	removeDomain( suggestion ) {
		this.props.recordRemoveDomainButtonClick( suggestion.domain_name );
		removeItem(
			domainRegistration( {
				domain: suggestion.domain_name,
				productSlug: suggestion.product_slug,
			} )
		);
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
		const { selectedSite, selectedSiteSlug, translate, isManagingAllDomains } = this.props;
		const classes = classnames( 'main-column', {
			'domain-search-page-wrapper': this.state.domainRegistrationAvailable,
		} );
		const { domainRegistrationMaintenanceEndTime } = this.state;

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
										cart={ this.props.cart }
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
							{ ! this.props.hasPlanInCart && <NewDomainsRedirectionNoticeUpsell /> }
							<RegisterDomainStep
								suggestion={ this.getInitialSuggestion() }
								domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
								onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
								onAddDomain={ this.handleAddRemoveDomain }
								onAddMapping={ this.handleAddMapping }
								onAddTransfer={ this.handleAddTransfer }
								cart={ this.props.cart }
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
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );

		return {
			domains: getDomainsBySiteId( state, siteId ),
			selectedSite: getSelectedSite( state ),
			selectedSiteId: siteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
			domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
			isSiteUpgradeable: isSiteUpgradeable( state, siteId ),
			productsList: getProductsList( state ),
			hasPlanInCart: hasPlan( ownProps.cart ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordRemoveDomainButtonClick,
	}
)( withShoppingCart( localize( DomainSearch ) ) );
