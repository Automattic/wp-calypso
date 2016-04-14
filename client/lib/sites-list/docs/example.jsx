/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Site = require( 'my-sites/site' ),
	AllSites = require( 'my-sites/all-sites' ),
	sites = require( 'lib/sites-list' )();

var Sites = React.createClass( {
	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/sites">Site and All Sites</a>
				</h2>
				<Site site={ sites.getPrimary() } />
				<AllSites sites={ sites.get() } />
			</div>
		);
	}
} );

module.exports = Sites;
