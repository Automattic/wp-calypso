/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	ReduxProvider = require( 'react-redux' ).Provider,
	startsWith = require( 'lodash/string/startsWith' ),
	qs = require( 'querystring' );

/**
 * Internal dependencies
 */
var actions = require( 'lib/posts/actions' ),
	PreferencesData = require( 'components/data/preferences-data' ),
	PostEditor = require( './post-editor' ),
	route = require( 'lib/route' ),
	i18n = require( 'lib/mixins/i18n' ),
	titleActions = require( 'lib/screen-title/actions' ),
	sites = require( 'lib/sites-list' )(),
	user = require( 'lib/user' )(),
	analytics = require( 'analytics' );

function getPostID( context ) {
	if ( ! context.params.post ) {
		return null;
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

function determinePostType( context ) {
	return startsWith( context.path, '/page' ) ? 'page' : 'post';
}

function renderEditor( context, postType ) {
	context.layout.setState( { section: 'post' } );

	React.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	React.render(
		React.createElement( ReduxProvider, { store: context.store }, () => {
			return React.createElement( PreferencesData, null,
				React.createElement( PostEditor, {
					sites: sites,
					type: postType
				} )
			)
		} ),
		document.getElementById( 'primary' )
	);
}

function maybeRedirect( context, postType, site ) {
	const siteId = context.params.site;
	const postId = context.params.post;
	const basePath = '/' + postType;

	if ( ! site ) {
		page.redirect( basePath );
		return true;
	}

	// matches `/post/:siteID/new` or `/page/:siteID/new`
	if ( 'new' === postId ) {
		page.redirect( basePath + '/' + site.slug );
		return true;
	}

	// if siteId is a number
	if ( /^\d+$/.test( siteId ) ) {
		if ( postId ) {
			// matches `/post/:siteID/:postId` OR `/page/:siteID/:postId`
			page.redirect( basePath + '/' + site.slug + '/' + postId );
		} else {
			// matches `/post/:siteID` OR `/page/:siteID`
			page.redirect( basePath + '/' + site.slug );
		}
		return true;
	}

	return false;
}

function getPressThisContent( text, url, title ) {
	return React.renderToStaticMarkup(
		<p>
			{ text ? <blockquote>{ text }</blockquote> : null }
			via <a href={ url }>{ title }</a>.
		</p>
	);
}

module.exports = {

	post: function( context ) {
		const postType = determinePostType( context );
		const postID = getPostID( context );

		function startEditing() {
			const site = sites.getSite( route.getSiteFragment( context.path ) );

			if ( maybeRedirect( context, postType, site ) ) {
				return;
			}

			let titleStrings;
			if ( 'page' === postType ) {
				titleStrings = {
					edit: i18n.translate( 'Edit Page', { textOnly: true } ),
					new: i18n.translate( 'New Page', { textOnly: true } ),
					ga: 'Page'
				};
			} else {
				titleStrings = {
					edit: i18n.translate( 'Edit Post', { textOnly: true } ),
					new: i18n.translate( 'New Post', { textOnly: true } ),
					ga: 'Post'
				};
			}
			// We have everything we need to start loading the post for editing,
			// so kick it off here to minimize time spent waiting for it to load
			// in the view components
			if ( postID ) {
				actions.startEditingExisting( site, postID );
				titleActions.setTitle( titleStrings.edit, { siteID: site.ID } );
				analytics.pageView.record( '/' + postType + '/:blogid/:postid', titleStrings.ga + ' > Edit' );
			} else {
				let postOptions = { type: postType };

				// handle press-this params if applicable
				if ( context.query.url ) {
					let pressThisContent = getPressThisContent( context.query.text, context.query.url, context.query.title );
					Object.assign( postOptions, {
						postFormat: 'quote',
						title: context.query.title,
						content: pressThisContent
					} );
				}

				actions.startEditingNew( site, postOptions );
				titleActions.setTitle( titleStrings.new, { siteID: site.ID } );
				analytics.pageView.record( '/' + postType, titleStrings.ga + ' > New' );
			}
		}

		if ( sites.initialized ) {
			startEditing();
		} else {
			sites.once( 'change', startEditing );
		}

		renderEditor( context, postType );
	},

	pressThis: function( context, next ) {
		if ( ! context.query.url ) {
			// not pressThis, early return
			return next();
		}

		const currentUser = user.get();

		if ( ! currentUser.primarySiteSlug ) {
			return next();
		}

		const redirectPath = route.addSiteFragment( context.pathname, currentUser.primarySiteSlug );
		const queryString = qs.stringify( context.query );
		const redirectWithParams = [ redirectPath, queryString ].join( '?' );

		page.redirect( redirectWithParams );
		return false;
	},
};
