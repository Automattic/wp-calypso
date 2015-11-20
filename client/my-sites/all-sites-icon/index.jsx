/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	union = require( 'lodash/array/union' );

/**
 * Internal dependencies
 */
var SiteIcon = require( 'components/site-icon' );

module.exports = React.createClass( {
	displayName: 'AllSitesIcon',

	propTypes: {
		sites: React.PropTypes.array.isRequired,
	},

	getMaxSites: function() {
		return this.props.sites.slice( 0, 3 );
	},

	getSitesWithIcons: function() {
		return this.props.sites.filter( function( site ) {
			return site.icon;
		} ).slice( 0, 3 );
	},

	getIcons: function() {
		var sites = union( this.getSitesWithIcons(), this.getMaxSites() ).slice( 0, 3 );

		return sites.map( function( site ) {
			return <SiteIcon site={ site } key={ site.ID + '-icon' } size={ 15 } />;
		} );
	},

	render: function() {
		var icons = this.getIcons(),
			classes;

		// Set element class attribute
		classes = 'all-sites-icon is-shape-' + this.getMaxSites().length;

		return (
			<div className={ classes }>
				{ icons }
			</div>
		);
	}
} );
