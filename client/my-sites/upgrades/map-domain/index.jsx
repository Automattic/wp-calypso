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
import { localize } from 'i18n-calypso';
import { currentUserHasFlag } from 'state/current-user/selectors';
import { isSiteUpgradeable, isSiteVip } from 'state/selectors';
import { getRawSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import Notice from 'components/notice';

var MapDomain = React.createClass( {
	mixins: [ observe( 'productsList' ) ],

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
		this.redirectAwayIfNotUpgradeable( this.props.selectedSiteIsUpgreadable );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.redirectAwayIfNotUpgradeable( nextProps.selectedSiteIsUpgreadable );
	},

	redirectAwayIfNotUpgradeable: function( isUpgradeable ) {
		if ( ! isUpgradeable ) {
			page.redirect( '/domains/add/mapping' );
		}
	},

	goBack: function() {
		if ( this.props.noSelectedSite ) {
			page( '/domains/add' );
			return;
		}

		if ( this.props.selectedSiteIsVip ) {
			page( paths.domainManagementList( this.props.selectedSiteSlug ) );
			return;
		}

		page( '/domains/add/' + this.props.selectedSiteSlug );
	},

	handleRegisterDomain( suggestion ) {
		upgradesActions.addItem(
			cartItems.domainRegistration( {
				productSlug: suggestion.product_slug,
				domain: suggestion.domain_name
			} )
		);

		if ( this.isMounted() ) {
			page( '/checkout/' + this.props.selectedSiteSlug );
		}
	},

	handleMapDomain( domain ) {
		this.setState( { errorMessage: null } );

		// For VIP sites we handle domain mappings differently
		// We don't go through the usual checkout process
		// Instead, we add the mapping directly
		if ( this.props.selectedSiteIsVip ) {
			wpcom.addVipDomainMapping( this.props.selectedSiteId, domain ).then( () => {
				page( paths.domainManagementList( this.props.selectedSiteSlug ) );
			}, error => this.setState( { errorMessage: error.message } ) );
			return;
		}

		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );

		if ( this.isMounted() ) {
			page( '/checkout/' + this.props.selectedSiteSlug );
		}
	},

	render: function() {
		return (
			<span>
				<HeaderCake onClick={ this.goBack }>
					{ this.props.translate( 'Map a Domain' ) }
				</HeaderCake>

				{ this.state.errorMessage && <Notice status="is-error" text={ this.state.errorMessage }/> }

				<MapDomainStep
					{ ...omit( this.props, [ 'children', 'productsList' ] ) }
					products={ this.props.productsList.get() }
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
		domainsWithPlansOnly: currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ),
		noSelectedSite: ! getRawSite( state, getSelectedSiteId( state ) ),
		selectedSiteId: getSelectedSiteId( state ),
		selectedSiteIsUpgreadable: isSiteUpgradeable( state, getSelectedSiteId( state ) ),
		selectedSiteIsVip: isSiteVip( state, getSelectedSiteId( state ) ),
		selectedSiteSlug: getSelectedSiteSlug( state ),
	}
) )( localize( MapDomain ) );
