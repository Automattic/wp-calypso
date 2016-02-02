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
var SingleSiteComponent = require( 'my-sites/themes/single-site' ),
	MultiSiteComponent = require( 'my-sites/themes/multi-site' ),
	LoggedOutComponent = require( 'my-sites/themes/logged-out' ),
	analytics = require( 'analytics' ),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	trackScrollPage = require( 'lib/track-scroll-page' ),
	getCurrentUser = require( 'state/current-user/selectors' ).getCurrentUser,
	buildTitle = require( 'lib/screen-title/utils' );

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
		let ThemesComponent;

		if ( site_id ) {
			basePath = basePath + '/:site_id';
			analyticsPageTitle += ' > Single Site';
		}

		if ( tier ) {
			analyticsPageTitle += ` > Type > ${titlecase( tier )}`;
		}

		if ( user ) {
			ThemesComponent = site_id ? SingleSiteComponent : MultiSiteComponent;
		} else {
			ThemesComponent = LoggedOutComponent;
		}

		analytics.pageView.record( basePath, analyticsPageTitle );
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( Head, { title, tier: tier || 'all' },
					React.createElement( ThemesComponent, {
						key: site_id,
						siteId: site_id,
						tier: tier,
						search: context.query.s,
						trackScrollPage: trackScrollPage.bind(
							null,
							basePath,
							analyticsPageTitle,
							'Themes'
						)
					} )
				)
			),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = controller;
