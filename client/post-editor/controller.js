/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import ReactDomServer from 'react-dom/server';
import React from 'react';
import i18n from 'i18n-calypso';
import page from 'page';
import { Provider as ReduxProvider } from 'react-redux';
import qs from 'querystring';
import { isWebUri as isValidUrl } from 'valid-url';
import { map, pick, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import route from 'lib/route';
import User from 'lib/user';
import userUtils from 'lib/user/utils';
import analytics from 'lib/analytics';
import { decodeEntities } from 'lib/formatting';
import PostEditor from './post-editor';
import { startEditingPost, stopEditingPost } from 'state/ui/editor/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, getEditorPath } from 'state/ui/editor/selectors';
import { editPost } from 'state/posts/actions';
import wpcom from 'lib/wp';
import Dispatcher from 'dispatcher';
import { getFeaturedImageId } from 'lib/posts/utils';

const user = User();

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
				user: user,
				userUtils: userUtils,
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

// TODO: REDUX - remove flux actions when whole post-editor is reduxified
// Until the full migration, the Copy Post functionality needs to dispatch both Flux and Redux actions:
// - (Flux) startEditingNew: to set the editor content;
// - (Redux) editPost: to set every other attribute (in particular, to update the Category Selector, terms can only be set via Redux);
// - (Flux) edit: to reliably show the updated post attributes before (auto)saving.
function startEditingPostCopy( siteId, postToCopyId, context ) {
	wpcom.site( siteId ).post( postToCopyId ).get().then( postToCopy => {
		const postAttributes = pick(
			postToCopy,
			'canonical_image',
			'content',
			'excerpt',
			'featured_image',
			'format',
			'metadata',
			'post_thumbnail',
			'terms',
			'title',
			'type'
		);
		postAttributes.tags = map( postToCopy.tags, 'name' );
		postAttributes.title = decodeEntities( postAttributes.title );
		postAttributes.featured_image = getFeaturedImageId( postToCopy );

		actions.startEditingNew( siteId, {
			content: postToCopy.content,
			title: postToCopy.title,
			type: postToCopy.type,
		} );
		context.store.dispatch( editPost( siteId, null, postAttributes ) );
		actions.edit( postAttributes );
	} ).catch( error => {
		Dispatcher.handleServerAction( {
			type: 'SET_POST_LOADING_ERROR',
			error: error
		} );
	} );
}

module.exports = {

	post: function( context ) {
		const postType = determinePostType( context );
		const postID = getPostID( context );
		const postToCopyId = context.query.copy;

		function startEditing( siteId ) {
			const isCopy = context.query.copy ? true : false;
			context.store.dispatch( startEditingPost( siteId, ( isCopy ? null : postID ), postType ) );

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
			if ( postToCopyId ) {
				startEditingPostCopy( siteId, postToCopyId, context );
				analytics.pageView.record( '/' + postType, gaTitle + ' > New' );
			} else if ( postID ) {
				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				actions.startEditingExisting( siteId, postID );
				analytics.pageView.record( '/' + postType + '/:blogid/:postid', gaTitle + ' > Edit' );
			} else {
				const postOptions = { type: postType };

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
		let unsubscribe;
		function startEditingOnSiteSelected() {
			const siteId = getSelectedSiteId( context.store.getState() );
			if ( ! siteId ) {
				return false;
			}

			if ( unsubscribe ) {
				unsubscribe();
			}

			startEditing( siteId );
			return true;
		}

		if ( ! startEditingOnSiteSelected() ) {
			unsubscribe = context.store.subscribe( startEditingOnSiteSelected );
		}

		renderEditor( context, postType );
	},

	exitPost: function( context, next ) {
		const postId = getPostID( context );
		const siteId = getSelectedSiteId( context.store.getState() );
		if ( siteId ) {
			context.store.dispatch( stopEditingPost( siteId, postId ) );
		}
		next();
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
