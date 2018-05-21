/** @format */

/**
 * External dependencies
 */

import ReactDomServer from 'react-dom/server';
import React from 'react';
import i18n from 'i18n-calypso';
import page from 'page';
import { stringify } from 'qs';
import { isWebUri as isValidUrl } from 'valid-url';
import { includes, map, pick, reduce, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import actions from 'lib/posts/actions';
import { addSiteFragment } from 'lib/route';
import User from 'lib/user';
import { decodeEntities } from 'lib/formatting';
import PostEditor from './post-editor';
import { startEditingPost, stopEditingPost } from 'state/ui/editor/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';
import { getEditorPostId, getEditorPath } from 'state/ui/editor/selectors';
import { editPost } from 'state/posts/actions';
import wpcom from 'lib/wp';
import Dispatcher from 'dispatcher';
import { getEditURL, getFeaturedImageId } from 'lib/posts/utils';

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

function renderEditor( context, props ) {
	context.primary = React.createElement( PostEditor, props );
}

function maybeRedirect( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );

	let path = getEditorPath( state, siteId, postId, 'post', context.query );
	if ( path !== context.pathname ) {
		if ( context.querystring ) {
			path += `?${ context.querystring }`;
		}
		page.redirect( path );
		return true;
	}

	return false;
}

function getPressThisContent( query ) {
	const { text, url, title, image, embed } = query;
	const pieces = [];

	if ( image ) {
		pieces.push(
			ReactDomServer.renderToStaticMarkup(
				<p>
					<a href={ url }>
						<img src={ image } />
					</a>
				</p>
			)
		);
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
				{ i18n.translate( 'via {{anchor/}}', {
					components: {
						anchor: <a href={ url }>{ title }</a>,
					},
				} ) }
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
function startEditingPostCopy( site, postToCopyId, context ) {
	wpcom
		.site( site.ID )
		.post( postToCopyId )
		.get( { context: 'edit' } )
		.then( postToCopy => {
			const postAttributes = pick(
				postToCopy,
				'canonical_image',
				'content',
				'excerpt',
				'featured_image',
				'format',
				'post_thumbnail',
				'terms',
				'title',
				'type'
			);
			postAttributes.tags = map( postToCopy.tags, 'name' );
			postAttributes.title = decodeEntities( postAttributes.title );
			postAttributes.featured_image = getFeaturedImageId( postToCopy );

			actions.startEditingNew( site, {
				content: postToCopy.content,
				title: postToCopy.title,
				type: postToCopy.type,
			} );
			actions.edit( postAttributes );

			/**
			 * A post attributes whitelist for Redux's `editPost()` action.
			 *
			 * This is needed because blindly passing all post attributes to `editPost()`
			 * caused some of them (notably the featured image) to revert to their original value
			 * when modified right after the copy.
			 *
			 * @see https://github.com/Automattic/wp-calypso/pull/13933
			 */
			const reduxPostAttributes = pick( postAttributes, [
				'excerpt',
				'featured_image',
				'format',
				'terms',
				'title',
			] );

			/**
			 * A post metadata whitelist for the `updatePostMetadata()` action.
			 *
			 * This is needed because blindly passing all post metadata to `editPost()`
			 * causes unforeseeable issues, such as Publicize not triggering on the copied post.
			 *
			 * @see https://github.com/Automattic/wp-calypso/issues/14840
			 */
			const metadataWhitelist = [ 'geo_latitude', 'geo_longitude' ];

			// Filter the post metadata to include only the ones we want to copy,
			// use only the `key` and `value` properties (and, most importantly exclude `id`),
			// and add an `operation` field to the copied values.
			const copiedMetadata = reduce(
				postToCopy.metadata,
				( copiedMeta, { key, value } ) => {
					if ( includes( metadataWhitelist, key ) ) {
						copiedMeta.push( { key, value, operation: 'update' } );
					}
					return copiedMeta;
				},
				[]
			);

			if ( copiedMetadata.length > 0 ) {
				reduxPostAttributes.metadata = copiedMetadata;
			}

			context.store.dispatch( editPost( site.ID, null, reduxPostAttributes ) );
		} )
		.catch( error => {
			Dispatcher.handleServerAction( {
				type: 'SET_POST_LOADING_ERROR',
				error: error,
			} );
		} );
}

const getAnalyticsPathAndTitle = ( postType, postId, postToCopyId ) => {
	const isPost = 'post' === postType;
	const isPage = 'page' === postType;
	const isNew = postToCopyId || ! postId;
	const isEdit = !! postId;

	if ( isPost && isNew ) {
		return [ '/post/:site', 'Post > New' ];
	}
	if ( isPost && isEdit ) {
		return [ '/post/:site/:post_id', 'Post > Edit' ];
	}
	if ( isPage && isNew ) {
		return [ '/page/:site', 'Page > New' ];
	}
	if ( isPage && isEdit ) {
		return [ '/page/:site/:post_id', 'Page > Edit' ];
	}
	if ( isNew ) {
		return [ `/edit/${ postType }/:site`, 'Custom Post Type > New' ];
	}
	if ( isEdit ) {
		return [ `/edit/${ postType }/:site/:post_id`, 'Custom Post Type > Edit' ];
	}
};

export default {
	post: function( context, next ) {
		const postType = determinePostType( context );
		const postID = getPostID( context );
		const postToCopyId = context.query.copy;

		function startEditing( siteId ) {
			const site = getSite( context.store.getState(), siteId );
			const isCopy = context.query.copy ? true : false;
			context.store.dispatch( startEditingPost( siteId, isCopy ? null : postID, postType ) );

			if ( maybeRedirect( context ) ) {
				return;
			}

			// We have everything we need to start loading the post for editing,
			// so kick it off here to minimize time spent waiting for it to load
			// in the view components
			if ( postToCopyId ) {
				startEditingPostCopy( site, postToCopyId, context );
			} else if ( postID ) {
				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				const contextPath = context.path;
				actions.startEditingExisting( site, postID ).then( editedPost => {
					if ( contextPath !== page.current ) {
						// browser navigated elsewhere while the load was in progress
						return;
					}

					if ( editedPost && editedPost.type && editedPost.type !== postType ) {
						// incorrect post type in URL
						page.redirect( getEditURL( editedPost, site ) );
					}
				} );
			} else {
				const postOptions = { type: postType };

				// handle press-this params if applicable
				if ( context.query.url ) {
					const pressThisContent = getPressThisContent( context.query );
					Object.assign( postOptions, {
						postFormat: 'quote',
						title: context.query.title,
						content: pressThisContent,
					} );
				}

				// TODO: REDUX - remove flux actions when whole post-editor is reduxified
				actions.startEditingNew( site, postOptions );
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

		const [ analyticsPath, analyticsTitle ] = getAnalyticsPathAndTitle(
			postType,
			postID,
			postToCopyId
		);
		renderEditor( context, { analyticsPath, analyticsTitle } );

		next();
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

		const redirectPath = addSiteFragment( context.pathname, currentUser.primarySiteSlug );
		const queryString = stringify( context.query );
		const redirectWithParams = [ redirectPath, queryString ].join( '?' );

		page.redirect( redirectWithParams );
		return false;
	},
};
