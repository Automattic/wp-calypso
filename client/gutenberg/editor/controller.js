/** @format */

/**
 * External dependencies
 */
import React from 'react';
import debug from 'debug';
import config, { isEnabled } from 'config';
import { has, uniqueId } from 'lodash';
import { setLocaleData } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import getCurrentLocaleSlug from 'state/selectors/get-current-locale-slug';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { EDITOR_START } from 'state/action-types';
import { requestFromUrl } from 'state/data-getters';
import { waitForData } from 'state/data-layer/http-data';
import { asyncLoader } from './async-loader';
import { Placeholder } from './placeholder';

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
	const domainJetpack = isEnabled( 'gutenberg/block/jetpack-preset' ) && {
		name: 'jetpack',
		url: 'jetpack-gutenberg-blocks',
	};
	const domains = domainJetpack ? [ domainDefault, domainJetpack ] : [ domainDefault ];

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

export const post = async ( context, next ) => {
	//see post-editor/controller.js for reference

	const uniqueDraftKey = uniqueId( 'gutenberg-draft-' );
	const postId = getPostID( context );
	const postType = determinePostType( context );
	const isDemoContent = ! postId && has( context.query, 'gutenberg-demo' );

	const makeEditor = import( './init' ).then( ( { initGutenberg } ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const userId = getCurrentUserId( state );

		//set postId on state.ui.editor.postId, so components like editor revisions can read from it
		context.store.dispatch( { type: EDITOR_START, siteId, postId } );

		const Editor = initGutenberg( userId, siteSlug );

		return props => (
			<Editor { ...{ siteId, postId, postType, uniqueDraftKey, isDemoContent, ...props } } />
		);
	} );

	const EditorLoader = asyncLoader( {
		promises: {
			Editor: makeEditor,
			translations: loadTranslations( context.store ),
		},
		loading: () => <Placeholder />,
		success: ( { Editor } ) => <Editor />,
		failure: () => <div>Couldn't load everything - try hitting reload in your browser…</div>,
	} );

	context.primary = <EditorLoader />;

	next();
};
