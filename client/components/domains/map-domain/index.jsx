/**
 * External dependencies
 */
var page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var HeaderCake = require( 'components/header-cake' ),
	MapDomainStep = require( 'components/domains/map-domain-step' ),
	observe = require( 'lib/mixins/data-observe' );

var MapDomain = React.createClass( {
	mixins: [ observe( 'productsList', 'sites' ) ],

	propTypes: {
		analyticsSection: React.PropTypes.string,
		query: React.PropTypes.string,
		productsList: React.PropTypes.object.isRequired
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
					initialState={ this.props.initialState }
					onAddDomain={ this.props.onAddDomain }
					onAddMapping={ this.props.onAddMapping }
					onSave={ this.props.onSave }
					cart={ this.props.cart }
					products={ this.props.productsList.get() }
					initialQuery={ this.props.initialQuery }
					selectedSite={ selectedSite }
					analyticsSection={ this.props.analyticsSection } />
			</span>
		);
	},
} );

module.exports = MapDomain;
