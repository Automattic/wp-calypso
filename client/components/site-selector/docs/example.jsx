/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SiteSelector from 'components/site-selector';
import sitesFactory from 'lib/sites-list';

// create user's sites object
const sites = sitesFactory();

export default React.createClass( {
	displayName: 'SiteSelector',

	selectSite( slug ) {
		console.log( `${slug} selected` );
	},

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/app-components/site-selector">SiteSelector</a>
				</h2>
				<SiteSelector
					onSiteSelect= { this.selectSite }
					sites={ sites }
				/>
			</div>
		);
	}
} );
