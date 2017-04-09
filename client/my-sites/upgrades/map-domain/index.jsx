/**
 * External dependencies
 */
var page = require( 'page' ),
	React = require( 'react' ),
	omit = require( 'lodash/omit' ),
	{ connect } = require( 'react-redux' );

/**
 * Internal dependencies
 */
var HeaderCake = require( 'components/header-cake' ),
	MapDomainStep = require( 'components/domains/map-domain-step' ),
	{ DOMAINS_WITH_PLANS_ONLY } = require( 'state/current-user/constants' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	upgradesActions = require( 'lib/upgrades/actions' ),
	observe = require( 'lib/mixins/data-observe' ),
	wpcom = require( 'lib/wp' ).undocumented(),
	paths = require( 'my-sites/upgrades/paths' );
import { currentUserHasFlag } from 'state/current-user/selectors';
import Notice from 'components/notice';

var MapDomain = React.createClass( {
	mixins: [ observe( 'productsList', 'sites' ) ],

	propTypes: {
		query: React.PropTypes.string,
		productsList: React.PropTypes.object.isRequired,
		domainsWithPlansOnly: React.PropTypes.bool.isRequired
	},

	getInitialState: function() {
		return {
			errorMessage: null
		};
	},

	componentWillMount: function() {
		this.checkSiteIsUpgradeable();
	},

	componentDidMount: function() {
		if ( this.props.sites ) {
			this.props.sites.on( 'change', this.checkSiteIsUpgradeable );
		}
	},

	componentWillUnmount: function() {
		if ( this.props.sites ) {
			this.props.sites.off( 'change', this.checkSiteIsUpgradeable );
		}
	},

	checkSiteIsUpgradeable: function( ) {
		if ( ! this.props.sites ) {
			return;
		}

		const selectedSite = this.props.sites.getSelectedSite();

		if ( selectedSite && ! selectedSite.isUpgradeable() ) {
			page.redirect( '/domains/add/mapping' );
		}
	},

	goBack: function() {
		const selectedSite = this.props.sites && this.props.sites.getSelectedSite();
		if ( ! selectedSite ) {
			page( this.props.path.replace( '/mapping', '' ) );
			return;
		}

		if ( selectedSite.is_vip ) {
			page( paths.domainManagementList( selectedSite.slug ) );
			return;
		}

		page( '/domains/add/' + selectedSite.slug );
	},

	handleRegisterDomain( suggestion ) {
		upgradesActions.addItem(
			cartItems.domainRegistration( {
				productSlug: suggestion.product_slug,
				domain: suggestion.domain_name
			} )
		);

		if ( this.isMounted() ) {
			page( '/checkout/' + this.props.sites.getSelectedSite().slug );
		}
	},

	handleMapDomain( domain ) {
		const selectedSite = this.props.sites.getSelectedSite();

		this.setState( { errorMessage: null } );

		// For VIP sites we handle domain mappings differently
		// We don't go through the usual checkout process
		// Instead, we add the mapping directly
		if ( selectedSite.is_vip ) {
			wpcom.addVipDomainMapping( selectedSite.ID, domain ).then( () => {
				page( paths.domainManagementList( selectedSite.slug ) );
			}, error => this.setState( { errorMessage: error.message } ) );
			return;
		}

		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );

		if ( this.isMounted() ) {
			page( '/checkout/' + selectedSite.slug );
		}
	},

	render: function() {
		let selectedSite;

		if ( this.props.sites ) {
			selectedSite = this.props.sites.getSelectedSite();
		}

		return (
			<span>
				<HeaderCake onClick={ this.goBack }>
					{ this.translate( 'Map a Domain' ) }
				</HeaderCake>

				{ this.state.errorMessage && <Notice status="is-error" text={ this.state.errorMessage }/> }

				<MapDomainStep
					{ ...omit( this.props, [ 'children', 'productsList', 'sites' ] ) }
					products={ this.props.productsList.get() }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onMapDomain={ this.handleMapDomain }
					analyticsSection="domains"
				/>
			</span>
		);
	}
} );

module.exports = connect( state => (
	{
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY )
	}
) )( MapDomain );
