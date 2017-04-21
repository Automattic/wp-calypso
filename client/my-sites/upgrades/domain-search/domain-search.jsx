/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import RegisterDomainStep from 'components/domains/register-domain-step';
import UpgradesNavigation from 'my-sites/upgrades/navigation';
import Main from 'components/main';
import upgradesActions from 'lib/upgrades/actions';
import cartItems from 'lib/cart-values/cart-items';
import analyticsMixin from 'lib/mixins/analytics';
import { currentUserHasFlag } from 'state/current-user/selectors';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';

const analytics = analyticsMixin( 'registerDomain' );

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

	state = {
		domainRegistrationAvailable: true
	};

	handleDomainsAvailabilityChange = ( isAvailable ) => {
		this.setState( { domainRegistrationAvailable: isAvailable } );
	};

	handleAddRemoveDomain = ( suggestion ) => {
		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.addDomain( suggestion );
		} else {
			this.removeDomain( suggestion );
		}
	};

	handleAddMapping = ( domain ) => {
		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );
		page( '/checkout/' + this.props.selectedSiteSlug );
	};

	componentWillMount() {
		this.checkSiteIsUpgradeable( this.props );
	}

	componentWillReceiveProps( nextProps ) {
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
		analytics.recordEvent( 'addDomainButtonClick', suggestion.domain_name, 'domains' );
		const items = [
			cartItems.domainRegistration( { domain: suggestion.domain_name, productSlug: suggestion.product_slug } )
		];

		if ( cartItems.isNextDomainFree( this.props.cart ) ) {
			items.push( cartItems.domainPrivacyProtection( {
				domain: suggestion.domain_name
			} ) );
		}

		upgradesActions.addItems( items );
		upgradesActions.goToDomainCheckout( suggestion );
	}

	removeDomain( suggestion ) {
		analytics.recordEvent( 'removeDomainButtonClick', suggestion.domain_name );
		upgradesActions.removeDomainFromCart( suggestion );
	}

	render() {
		const { selectedSite, selectedSiteSlug, translate } = this.props,
			classes = classnames( 'main-column', {
				'domain-search-page-wrapper': this.state.domainRegistrationAvailable
			} );
		let content;

		if ( ! this.state.domainRegistrationAvailable || isEmpty( this.props.productsList ) ) {
			content = (
				<EmptyContent
					illustration="/calypso/images/drake/drake-500.svg"
					title={ translate( 'Domain registration is unavailable' ) }
					line={ translate( "We're hard at work on the issue. Please check back shortly." ) }
					action={ translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + selectedSiteSlug } />
			);
		} else {
			content = (
				<span>
					<div className="domain-search__content">
						<UpgradesNavigation
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						<RegisterDomainStep
							path={ this.props.context.path }
							suggestion={ this.props.context.params.suggestion }
							domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
							onDomainsAvailabilityChange={ this.handleDomainsAvailabilityChange }
							onAddDomain={ this.handleAddRemoveDomain }
							onAddMapping={ this.handleAddMapping }
							cart={ this.props.cart }
							selectedSite={ selectedSite }
							offerMappingOption
							basePath={ this.props.basePath }
							products={ this.props.productsList } />
					</div>
				</span>
			);
		}

		return (
			<Main className={ classes }>
				<QueryProductsList />
				<SidebarNavigation />
				{ content }
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		selectedSiteId: getSelectedSiteId( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		productsList: state.productsList.items,
	} )
)( localize( DomainSearch ) );
