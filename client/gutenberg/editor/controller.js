/** @format */
/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import debugFactory from 'debug';
import page from 'page';
import { has, set, uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { setLocaleData } from '@wordpress/i18n';
import { dispatch, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import isGutenbergEnabled from 'state/selectors/is-gutenberg-enabled';
import { asyncLoader } from './async-loader';
import { EDITOR_START } from 'state/action-types';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { Placeholder } from './placeholder';
import { JETPACK_DATA_PATH } from 'gutenberg/extensions/presets/jetpack/utils/get-jetpack-data';
import { requestFromUrl, requestGutenbergBlockAvailability } from 'state/data-getters';
import { waitForData } from 'state/data-layer/http-data';

const debug = debugFactory( 'calypso:gutenberg:controller' );

function determinePostType( context ) {
	if ( context.path.startsWith( '/block-editor/post/' ) ) {
		return 'post';
	}
	if ( context.path.startsWith( '/block-editor/page/' ) ) {
		return 'page';
	}

	return context.params.customPostType;
}

//duplicated from post-editor/controller.js. We should import it from there instead
function getPostID( context ) {
	if ( ! context.params.post || 'new' === context.params.post ) {
		return null;
	}

	// both post and site are in the path
	return parseInt( context.params.post, 10 );
}

export const loadTranslations = store => {
	const domainDefault = { name: 'default', url: 'gutenberg' };
	const domainJetpack = {
		name: 'jetpack',
		url: 'jetpack-gutenberg-blocks',
	};
	const domains = [ domainDefault, domainJetpack ];

	const state = store.getState();
	const localeSlug = getCurrentLocaleSlug( state );

	// We don't need to localize English
	if ( ! localeSlug || localeSlug === config( 'i18n_default_locale_slug' ) ) {
		return Promise.resolve();
	}

	const query = domains.reduce( ( currentQuery, domain ) => {
		const { name, url } = domain;
		const languageFileUrl = `https://widgets.wp.com/languages/${ url }/${ localeSlug }.json?t=2`;
		return {
			...currentQuery,
			[ name ]: () => requestFromUrl( languageFileUrl ),
		};
	}, {} );

	return waitForData( query ).then( responses => {
		Object.entries( responses ).forEach( ( [ domain, { state: requestState, data } ] ) => {
			if ( requestState === 'failure' ) {
				debug(
					`Encountered an error loading locale file for domain ${ domain } and locale ${ localeSlug }. Falling back to English.`
				);
				return Promise.reject();
			} else if ( data ) {
				const localeData = {
					'': {
						domain,
						lang: localeSlug,
					},
					...data.body,
				};
				setLocaleData( localeData, domain );
			}
		} );
	} );
};

export const loadGutenbergBlockAvailability = store => {
	const state = store.getState();
	const siteSlug = getSelectedSiteSlug( state );

	return waitForData( {
		blockAvailability: () => requestGutenbergBlockAvailability( siteSlug ),
	} ).then( ( { blockAvailability } ) => {
		if ( 'success' === blockAvailability.state && blockAvailability.data ) {
			set( window, [ JETPACK_DATA_PATH, 'available_blocks' ], blockAvailability.data );
		}
	} );
};

export const resetGutenbergState = ( registry, selectedSiteId ) => {
	// Always reset core/editor, core/notices, and other UI parts
	registry.reset( 'core/editor' );
	registry.reset( 'core/notices' );
	dispatch( 'core/edit-post' ).closePublishSidebar();
	dispatch( 'core/edit-post' ).closeModal();

	// Only reset core/data on site change
	const previousGutenbergSiteId = select( 'gutenberg/calypso' ).getSelectedSiteId();

	if ( !! previousGutenbergSiteId && previousGutenbergSiteId !== selectedSiteId ) {
		registry.resetCoreResolvers();
	}
	dispatch( 'gutenberg/calypso' ).setSelectedSiteId( selectedSiteId );
};

export const redirect = ( { store: { getState } }, next ) => {
	const state = getState();
	const siteId = getSelectedSiteId( state );
	const hasGutenberg = isGutenbergEnabled( state, siteId );

	if ( hasGutenberg ) {
		return next();
	}

	return page.redirect( `/post/${ getSelectedSiteSlug( state ) }` );
};

export const post = async ( context, next ) => {
	//see post-editor/controller.js for reference

	const uniqueDraftKey = uniqueId( 'gutenberg-draft-' );
	const postId = getPostID( context );
	const postType = determinePostType( context );
	const isDemoContent = ! postId && has( context.query, 'gutenberg-demo' );

	const makeEditor = import( './init' ).then( ( { initGutenberg } ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );

		//set postId on state.ui.editor.postId, so components like editor revisions can read from it
		context.store.dispatch( { type: EDITOR_START, siteId, postId } );

		const { Editor, registry } = initGutenberg( userId, context.store );

		resetGutenbergState( registry, siteId );

		return props => (
			<Editor { ...{ siteId, postId, postType, uniqueDraftKey, isDemoContent, ...props } } />
		);
	} );

	const EditorLoader = asyncLoader( {
		promises: {
			Editor: makeEditor,
			translations: loadTranslations( context.store ),
			blockAvailability: loadGutenbergBlockAvailability( context.store ),
		},
		loading: () => <Placeholder />,
		success: ( { Editor } ) => <Editor />,
		failure: () => <div>Couldn't load everything - try hitting reload in your browser…</div>,
	} );

	context.primary = <EditorLoader />;

	next();
};
