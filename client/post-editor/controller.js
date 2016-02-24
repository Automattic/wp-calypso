/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	ReactDomServer = require( 'react-dom/server' ),
	React = require( 'react' ),
	page = require( 'page' ),
	ReduxProvider = require( 'react-redux' ).Provider,
	startsWith = require( 'lodash/startsWith' ),
	qs = require( 'querystring' ),
	isValidUrl = require( 'valid-url' ).isWebUri;

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

import {
	setEditingMode,
	startEditingNew,
	startEditingExisting,
	EDITING_MODES
} from 'state/ui/editor/post/actions';
import { setEditorPostId } from 'state/ui/editor/actions';
import { editPost } from 'state/posts/actions';

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
	ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	ReactDom.render(
		React.createElement( ReduxProvider, { store: context.store },
			React.createElement( PreferencesData, null,
				React.createElement( PostEditor, {
					sites: sites,
					type: postType
				} )
			)
		),
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

		function startEditing() {
			const site = sites.getSite( route.getSiteFragment( context.path ) );

			if ( maybeRedirect( context, postType, site ) ) {
				return;
			}

			context.store.dispatch( setEditorPostId( postID ) );
			context.store.dispatch( editPost( { type: postType }, site.ID, postID ) );

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
				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				actions.startEditingExisting( site, postID );
				titleActions.setTitle( titleStrings.edit, { siteID: site.ID } );
				analytics.pageView.record( '/' + postType + '/:blogid/:postid', titleStrings.ga + ' > Edit' );

				context.store.dispatch( setEditingMode( EDITING_MODES.EXISTING, titleStrings.edit, { siteID: site.ID } ) );
				context.store.dispatch( startEditingExisting( site, postID ) );
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
				actions.startEditingNew( site, postOptions );
				titleActions.setTitle( titleStrings.new, { siteID: site.ID } );
				analytics.pageView.record( '/' + postType, titleStrings.ga + ' > New' );

				context.store.dispatch( setEditingMode( EDITING_MODES.NEW, titleStrings.new, { siteID: site.ID } ) );
				context.store.dispatch( startEditingNew( site, postOptions ) );
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
	},
};
