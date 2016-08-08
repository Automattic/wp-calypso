/**
* External dependencies
*/
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Site = require( 'blocks/site' ),
	AllSites = require( 'my-sites/all-sites' ),
	sites = require( 'lib/sites-list' )();

import Card from 'components/card';

var Sites = React.createClass( {
	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/sites">Site and All Sites</a>
				</h2>
				<Card style={ { padding: 0 } }>
					<Site site={ sites.getPrimary() } />
				</Card>
				<Card style={ { padding: 0 } }>
					<AllSites sites={ sites.get() } />
				</Card>
			</div>
		);
	}
} );

module.exports = Sites;
