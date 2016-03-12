/**
 * External Dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	ReduxProvider = require( 'react-redux' ).Provider;

/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	Tailor = require( './tailor' ),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	analytics = require( 'analytics' ),
	titleActions = require( 'lib/screen-title/actions' );

module.exports = {

	tailor: function( context ) {
		var basePath = route.sectionify( context.path ),
			siteID = route.getSiteFragment( context.path );

		analytics.pageView.record( basePath, 'Customizer' );

		titleActions.setTitle( i18n.translate( 'Customizer', { textOnly: true } ), { siteID: siteID } );

		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( Tailor, {
					domain: context.params.domain || '',
					sites: sites,
					prevPath: context.prevPath || '',
					query: context.query
				} )
			),
			document.getElementById( 'primary' )
		);
	}

};
