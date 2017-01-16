/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var SidebarNavigation = require( 'components/sidebar-navigation' ),
	AllSitesIcon = require( 'my-sites/all-sites-icon' ),
	SiteIcon = require( 'blocks/site-icon' ),
	sites = require( 'lib/sites-list' )();

module.exports = React.createClass( {
	displayName: 'SidebarNavigation',

	render: function() {
		var site = sites.getSelectedSite(),
			currentSiteTitle = site.title,
			allSitesClass;

		if ( ! site ) {
			currentSiteTitle = this.translate( 'All Sites' );
			allSitesClass = 'all-sites';
		}

		return (
			<SidebarNavigation
				linkClassName={ allSitesClass }
				sectionName="site"
				sectionTitle={ currentSiteTitle }>
				{ site ?
					<SiteIcon site={ site } size={ 30 } /> :
					<AllSitesIcon sites={ sites.get() } /> }
			</SidebarNavigation>
		);
	}
} );
