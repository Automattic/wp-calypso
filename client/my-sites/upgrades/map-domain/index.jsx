/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import MapDomainStep from 'components/domains/map-domain-step';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { cartItems } from 'lib/cart-values';
import upgradesActions from 'lib/upgrades/actions';
import wp from 'lib/wp';
import paths from 'my-sites/upgrades/paths';
import Notice from 'components/notice';
import { currentUserHasFlag } from 'state/current-user/selectors';
import isSiteUpgradeable from 'state/selectors/is-site-upgradeable';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryProductsList from 'components/data/query-products-list';

const wpcom = wp.undocumented();

class MapDomain extends Component {
	static propTypes = {
		initialQuery: React.PropTypes.string,
		query: React.PropTypes.string,
		cart: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object,
		getSelectedSiteSlug: React.PropTypes.string,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired,
		isSiteUpgradeable: React.PropTypes.bool,
		productsList: React.PropTypes.object.isRequired,
		translate: React.PropTypes.func.isRequired,
	};

	constructor() {
		super();
		this.handleRegisterDomain = this.handleRegisterDomain.bind( this );
		this.handleMapDomain = this.handleMapDomain.bind( this );
		this.goBack = this.goBack.bind( this );
		this.state = {
			errorMessage: null
		};
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

	goBack() {
		const {
			selectedSite,
			selectedSiteSlug,
		} = this.props;

		if ( ! selectedSite ) {
			page( paths.domainManagementRoot() );
			return;
		}

		if ( selectedSite.is_vip ) {
			page( paths.domainManagementList( selectedSiteSlug ) );
			return;
		}

		page( '/domains/add/' + selectedSiteSlug );
	}

	handleRegisterDomain( suggestion ) {
		const { selectedSiteSlug } = this.props;

		upgradesActions.addItem(
			cartItems.domainRegistration( {
				productSlug: suggestion.product_slug,
				domain: suggestion.domain_name
			} )
		);

		page( '/checkout/' + selectedSiteSlug );
	}

	handleMapDomain( domain ) {
		const { selectedSite, selectedSiteSlug } = this.props;

		this.setState( { errorMessage: null } );

		// For VIP sites we handle domain mappings differently
		// We don't go through the usual checkout process
		// Instead, we add the mapping directly
		if ( selectedSite.is_vip ) {
			wpcom.addVipDomainMapping( selectedSite.ID, domain )
				.then(
					() => page( paths.domainManagementList( selectedSiteSlug ) ),
					( error ) => this.setState( { errorMessage: error.message } )
				);
			return;
		}

		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );

		page( '/checkout/' + selectedSiteSlug );
	}

	render() {
		const {
			cart,
			domainsWithPlansOnly,
			initialQuery,
			productsList,
			selectedSite,
			translate,
		} = this.props;

		const {
			errorMessage
		} = this.state;

		return (
			<span>
				<HeaderCake onClick={ this.goBack }>
					{ translate( 'Map a Domain' ) }
				</HeaderCake>

				{ errorMessage && <Notice status="is-error" text={ errorMessage } /> }

				<MapDomainStep
					cart={ cart }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					initialQuery={ initialQuery }
					products={ productsList }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onMapDomain={ this.handleMapDomain }
					analyticsSection="domains"
				/>

				<QueryProductsList />
			</span>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedSite: getSelectedSite( state ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		isSiteUpgradeable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		productsList: state.productsList.items,
	} )
)( localize( MapDomain ) );
