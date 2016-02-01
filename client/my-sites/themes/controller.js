/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	ReduxProvider = require( 'react-redux' ).Provider,
	titlecase = require( 'to-title-case' );

/**
 * Internal Dependencies
 */
var ThemesComponent = require( 'my-sites/themes/main' ),
	analytics = require( 'analytics' ),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	trackScrollPage = require( 'lib/track-scroll-page' ),
	getCurrentUser = require( 'state/current-user/selectors' ).getCurrentUser,
	buildTitle = require( 'lib/screen-title/utils' ),
	SSRTest = require( 'components/SSRTest' );

var controller = {

	themes: function( context ) {
		const { tier, site_id } = context.params;
		const user = getCurrentUser( context.store.getState() );
		const title = buildTitle(
			i18n.translate( 'Themes', { textOnly: true } ),
			{ siteID: site_id } );
		const Head = user
			? require( 'layout/head' )
			: require( 'my-sites/themes/head' );

		let basePath = route.sectionify( context.path );
		let analyticsPageTitle = 'Themes';

		if ( site_id ) {
			basePath = basePath + '/:site_id';
			analyticsPageTitle += ' > Single Site';
		}

		if ( tier ) {
			analyticsPageTitle += ` > Type > ${titlecase( tier )}`;
		}

		analytics.pageView.record( basePath, analyticsPageTitle );

		ReactDom.render( React.createElement( SSRTest ), document.getElementById( 'primary' ) );
	}
};

module.exports = controller;
