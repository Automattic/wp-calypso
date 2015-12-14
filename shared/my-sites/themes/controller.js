/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	titlecase = require( 'to-title-case' );

/**
 * Internal Dependencies
 */
var ThemesComponent = require( 'my-sites/themes/main' ),
	analytics = require( 'analytics' ),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	trackScrollPage = require( 'lib/track-scroll-page' ),
	sites = require( 'lib/sites-list' )(),
	titleActions = require( 'lib/screen-title/actions' );

var controller = {

	themes: function( context ) {
		var basePath = route.sectionify( context.path ),
			analyticsPageTitle = 'Themes',
			{ tier, site_id } = context.params;

		titleActions.setTitle(
			i18n.translate( 'Themes', { textOnly: true } ),
			{ siteID: context.params.site_id }
		);

		if ( site_id ) {
			basePath = basePath + '/:site_id';
			analyticsPageTitle += ' > Single Site';
		}

		if ( tier ) {
			analyticsPageTitle += ` > Type > ${titlecase( tier )}`;
		}

		analytics.pageView.record( basePath, analyticsPageTitle );

		ReactDom.render(
			React.createElement( ThemesComponent, {
				key: site_id,
				siteId: site_id,
				sites: sites,
				tier: tier,
				search: context.query.s,
				trackScrollPage: trackScrollPage.bind(
					null,
					basePath,
					analyticsPageTitle,
					'Themes'
				)
			} ),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = controller;
