/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	ReactDomServer = require( 'react-dom/server' ),
	React = require( 'react' ),
	i18n = require( 'i18n-calypso' ),
	page = require( 'page' ),
	ReduxProvider = require( 'react-redux' ).Provider,
	startsWith = require( 'lodash/startsWith' ),
	qs = require( 'querystring' ),
	isValidUrl = require( 'valid-url' ).isWebUri;

/**
 * Internal dependencies
 */
var actions = require( 'lib/posts/actions' ),
	PostEditor = require( './post-editor' ),
	route = require( 'lib/route' ),
	sites = require( 'lib/sites-list' )(),
	user = require( 'lib/user' )(),
	analytics = require( 'lib/analytics' );
import { setEditorPostId } from 'state/ui/editor/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, getEditorPath } from 'state/ui/editor/selectors';
import { editPost } from 'state/posts/actions';

function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

function determinePostType( context ) {
	if ( startsWith( context.path, '/post' ) ) {
		return 'post';
	}

	if ( startsWith( context.path, '/page' ) ) {
		return 'page';
	}

	return context.params.type;
}

function renderEditor( context, postType ) {
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( PostEditor, {
				sites: sites,
				type: postType
			} )
		),
		document.getElementById( 'primary' )
	);
}

function maybeRedirect( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );

	const path = getEditorPath( state, siteId, postId );
	if ( path !== context.pathname ) {
		page.redirect( path );
		return true;
	}

	return false;
}

function getPressThisContent( query ) {
	const { text, url, title, image, embed } = query;
	const pieces = [];

	if ( image ) {
		pieces.push( ReactDomServer.renderToStaticMarkup( <p><a href={ url }><img src={ image } /></a></p> ) );
	}
	if ( isValidUrl( embed ) ) {
		pieces.push( ReactDomServer.renderToStaticMarkup( <p>{ embed }</p> ) );
	}
	if ( text ) {
		pieces.push( ReactDomServer.renderToStaticMarkup( <blockquote>{ text }</blockquote> ) );
	}

	pieces.push(
		ReactDomServer.renderToStaticMarkup(
			<p>
				{
					i18n.translate( 'via {{anchor/}}', {
						components: {
							anchor: ( <a href={ url }>{ title }</a> )
						}
					} )
				}
			</p>
		)
	);

	return pieces.join( '\n\n' );
}

module.exports = {

	post: function( context ) {
		const postType = determinePostType( context );
		const postID = getPostID( context );

		function startEditing( siteId ) {
			context.store.dispatch( setEditorPostId( postID ) );
			context.store.dispatch( editPost( { type: postType }, siteId, postID ) );

			if ( maybeRedirect( context ) ) {
				return;
			}

			let gaTitle;
			switch ( postType ) {
				case 'post': gaTitle = 'Post'; break;
				case 'page': gaTitle = 'Page'; break;
				default: gaTitle = 'Custom Post Type';
			}

			// We have everything we need to start loading the post for editing,
			// so kick it off here to minimize time spent waiting for it to load
			// in the view components
			if ( postID ) {
				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				actions.startEditingExisting( siteId, postID );
				analytics.pageView.record( '/' + postType + '/:blogid/:postid', gaTitle + ' > Edit' );
			} else {
				let postOptions = { type: postType };

				// handle press-this params if applicable
				if ( context.query.url ) {
					const pressThisContent = getPressThisContent( context.query );
					Object.assign( postOptions, {
						postFormat: 'quote',
						title: context.query.title,
						content: pressThisContent
					} );
				}

				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				actions.startEditingNew( siteId, postOptions );
				analytics.pageView.record( '/' + postType, gaTitle + ' > New' );
			}
		}

		// Before starting to edit, we want to be sure that we have a valid
		// selected site to work with. Therefore, we wait on the following
		// conditions:
		//  - Sites have not yet been initialized (no localStorage available)
		//  - Sites are initialized, but the site ID is unknown, so we wait for
		//    the sites list to be refreshed (for example, if the user does not
		//    have permission to view the site)
		//  - Sites are initialized _and_ fetched, but the selected site has
		//    not yet been selected, so is not available in global state yet
		function startEditingOnSiteSelected() {
			const siteId = getSelectedSiteId( context.store.getState() );

			if ( siteId ) {
				startEditing( siteId );
			} else {
				sites.once( 'change', startEditingOnSiteSelected );
			}
		}
		startEditingOnSiteSelected();

		renderEditor( context, postType );
	},

	pressThis: function( context, next ) {
		context.getSiteSelectionHeaderText = function() {
			return i18n.translate( 'Select a site to start writing' );
		};

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
	}
};
