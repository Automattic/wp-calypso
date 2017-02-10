/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Component } from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import isEmpty from 'lodash/isEmpty';

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
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';

const analytics = analyticsMixin( 'registerDomain' );

class DomainSearch extends Component {
	static propTypes = {
		selectedSite: React.PropTypes.object.isRequired,
		productsList: React.PropTypes.object.isRequired,
		basePath: React.PropTypes.string.isRequired,
		context: React.PropTypes.object.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired
	};

	constructor() {
		super();
		this.handleDomainsAvailabilityChange = this.handleDomainsAvailabilityChange.bind( this );
		this.handleAddRemoveDomain = this.handleAddRemoveDomain.bind( this );
		this.handleAddMapping = this.handleAddMapping.bind( this );
		this.state = { domainRegistrationAvailable: true };
	}

	componentDidMount() {
		this.checkSiteIsUpgradeable();
	}

	componentWillReceiveProps() {
		this.checkSiteIsUpgradeable();
	}

	checkSiteIsUpgradeable() {
		if ( this.props.selectedSite && ! this.props.isSiteUpgradeable ) {
			page.redirect( '/domains/add' );
		}
	}

	handleDomainsAvailabilityChange( isAvailable ) {
		this.setState( { domainRegistrationAvailable: isAvailable } );
	}

	handleAddRemoveDomain( suggestion ) {
		if ( ! cartItems.hasDomainInCart( this.props.cart, suggestion.domain_name ) ) {
			this.addDomain( suggestion );
		} else {
			this.removeDomain( suggestion );
		}
	}

	handleAddMapping( domain ) {
		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );
		page( '/checkout/' + this.props.selectedSite.slug );
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
		const { selectedSite, translate } = this.props,
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
					actionURL={ '/plans/' + selectedSite.slug } />
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
				<SidebarNavigation />
				{ content }
				<QueryProductsList />
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		productsList: state.productsList.items,
	} )
)( localize( DomainSearch ) );
