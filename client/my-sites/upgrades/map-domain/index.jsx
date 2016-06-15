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
	{ currentUserHasFlag } = require( 'state/current-user/selectors' ),
	cartItems = require( 'lib/cart-values' ).cartItems,
	upgradesActions = require( 'lib/upgrades/actions' ),
	observe = require( 'lib/mixins/data-observe' );

var MapDomain = React.createClass( {
	mixins: [ observe( 'productsList', 'sites' ) ],

	propTypes: {
		analyticsSection: React.PropTypes.string,
		query: React.PropTypes.string,
		productsList: React.PropTypes.object.isRequired,
		withPlansOnly: React.PropTypes.bool.isRequired
	},

	getDefaultProps: function() {
		return { analyticsSection: 'domains' };
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
		if ( ! this.props.sites ) {
			return page( this.props.path.replace( '/mapping', '' ) );
		}

		page( '/domains/add/' + this.props.sites.getSelectedSite().slug );
	},

	handleRegisterDomain( suggestion ) {
		upgradesActions.registerDomain( suggestion );
	},

	handleMapDomain( domain ) {
		upgradesActions.addItem( cartItems.domainMapping( { domain } ) );

		if ( this.isMounted() ) {
			page( '/checkout/' + this.props.sites.getSelectedSite().slug );
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

				<MapDomainStep
					{ ...omit( this.props, [ 'children', 'productsList', 'sites' ] ) }
					products={ this.props.productsList.get() }
					selectedSite={ selectedSite }
					onRegisterDomain={ this.handleRegisterDomain }
					onMapDomain={ this.handleMapDomain }
				/>
			</span>
		);
	}
} );

module.exports = connect( state => (
	{
		domainsWithPlansOnly: currentUserHasFlag( state, 'calypso_domains_with_plans_only' )
	}
) )( MapDomain );
