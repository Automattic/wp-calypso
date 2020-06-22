/**
 * External dependencies
 */

import ReactDomServer from 'react-dom/server';
import React from 'react';
import i18n from 'i18n-calypso';
import page from 'page';
import { stringify } from 'qs';
import { isWebUri as isValidUrl } from 'valid-url';
import { get, has, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { recordPlaceholdersTiming } from 'lib/perfmon';
import { startEditingPostCopy, startEditingExistingPost } from 'state/posts/actions';
import { addQueryArgs, addSiteFragment } from 'lib/route';
import PostEditor from './post-editor';
import { getCurrentUser } from 'state/current-user/selectors';
import { startEditingNewPost, stopEditingPost } from 'state/ui/editor/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite } from 'state/sites/selectors';
import { getEditorNewPostPath } from 'state/ui/editor/selectors';
import { getEditURL } from 'state/posts/utils';
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import { requestSelectedEditor, setSelectedEditor } from 'state/selected-editor/actions';
import { getGutenbergEditorUrl } from 'state/selectors/get-gutenberg-editor-url';
import { shouldLoadGutenberg } from 'state/selectors/should-load-gutenberg';
import { shouldRedirectGutenberg } from 'state/selectors/should-redirect-gutenberg';

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
	const postType = determinePostType( context );
	const postId = getPostID( context );

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	if ( postId === null ) {
		let path = getEditorNewPostPath( state, siteId, postType );
		if ( path !== context.pathname ) {
			if ( context.querystring ) {
				path += `?${ context.querystring }`;
			}
			page.redirect( path );
			return true;
		}
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
						<img alt="" src={ image } />
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

function waitForSiteIdAndSelectedEditor( context ) {
	return new Promise( ( resolve ) => {
		const unsubscribe = context.store.subscribe( () => {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			if ( ! siteId ) {
				return;
			}
			const selectedEditor = getSelectedEditor( state, siteId );
			if ( ! selectedEditor ) {
				return;
			}
			unsubscribe();
			resolve();
		} );
		// Trigger a `store.subscribe()` callback
		context.store.dispatch(
			requestSelectedEditor( getSelectedSiteId( context.store.getState() ) )
		);
	} );
}

async function redirectIfBlockEditor( context, next ) {
	const tmpState = context.store.getState();
	const selectedEditor = getSelectedEditor( tmpState, getSelectedSiteId( tmpState ) );
	if ( ! selectedEditor ) {
		await waitForSiteIdAndSelectedEditor( context );
	}

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	// URLs with a set-editor=<editorName> param are used for indicating that the user wants to use always the given
	// editor, so we update the selected editor for the current user/site pair.
	const newEditorChoice = get( context.query, 'set-editor' );
	const allowedEditors = [ 'classic', 'gutenberg' ];

	if ( allowedEditors.indexOf( newEditorChoice ) > -1 ) {
		context.store.dispatch( setSelectedEditor( siteId, newEditorChoice ) );
	}

	// If the new editor is classic, we bypass the selected editor check.
	if ( 'classic' === newEditorChoice ) {
		return next();
	}

	if ( ! shouldLoadGutenberg( state, siteId ) ) {
		return next();
	}

	const postType = determinePostType( context );
	const postId = getPostID( context );
	// pass along parameters, for example press-this
	const gutenbergUrl = getGutenbergEditorUrl( state, siteId, postId, postType );
	const url = addQueryArgs( context.query, gutenbergUrl );
	if ( shouldRedirectGutenberg( state, siteId ) ) {
		return window.location.replace( url );
	}
	return page.redirect( url );
}

export default {
	post: function ( context, next ) {
		const postType = determinePostType( context );
		const postId = getPostID( context );
		const postToCopyId = context.query[ 'jetpack-copy' ];

		recordPlaceholdersTiming();

		function startEditing( siteId ) {
			if ( maybeRedirect( context ) ) {
				return;
			}

			// We have everything we need to start loading the post for editing,
			// so kick it off here to minimize time spent waiting for it to load
			// in the view components
			if ( postToCopyId ) {
				context.store.dispatch( startEditingPostCopy( siteId, postToCopyId ) );
			} else if ( postId ) {
				const contextPath = context.path;
				context.store
					.dispatch( startEditingExistingPost( siteId, postId ) )
					.then( ( editedPost ) => {
						if ( contextPath !== page.current ) {
							// browser navigated elsewhere while the load was in progress
							return;
						}

						if ( editedPost && editedPost.type && editedPost.type !== postType ) {
							// incorrect post type in URL
							page.redirect(
								getEditURL( editedPost, getSite( context.store.getState(), siteId ) )
							);
						}
					} );
			} else {
				const post = { type: postType };

				// handle press-this params if applicable
				if ( context.query.url ) {
					const pressThisContent = getPressThisContent( context.query );
					Object.assign( post, {
						format: 'quote',
						title: context.query.title,
						content: pressThisContent,
					} );
				}

				context.store.dispatch( startEditingNewPost( siteId, post ) );
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
			postId,
			postToCopyId
		);
		renderEditor( context, { analyticsPath, analyticsTitle } );

		next();
	},

	exitPost: function ( context, next ) {
		const postId = getPostID( context );
		const siteId = getSelectedSiteId( context.store.getState() );
		if ( siteId ) {
			context.store.dispatch( stopEditingPost( siteId, postId ) );
		}
		next();
	},

	pressThis: function ( context, next ) {
		if ( ! context.query.url ) {
			// not pressThis, early return
			return next();
		}

		const { primarySiteSlug } = getCurrentUser( context.store.getState() );

		if ( ! primarySiteSlug ) {
			return next();
		}

		const redirectPath = addSiteFragment( context.pathname, primarySiteSlug );
		const queryString = stringify( context.query );
		const redirectWithParams = [ redirectPath, queryString ].join( '?' );

		page.redirect( redirectWithParams );
		return false;
	},

	gutenberg: ( context, next ) => {
		if ( ! has( window, 'location.replace' ) ) {
			next();
		}

		redirectIfBlockEditor( context, next );
	},
};
