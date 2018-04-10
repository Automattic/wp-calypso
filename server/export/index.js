/** @format */

/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
import { resolve, join } from 'path';
import { writeFile } from 'fs';
import { pick, partial } from 'lodash';
import { createElement } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import filenamify from 'filenamify';

/**
 * Internal dependencies
 */
import config from 'config';
import { isDefaultLocale } from 'lib/i18n-utils';
import {
	getDocumentHeadFormattedTitle,
	getDocumentHeadMeta,
	getDocumentHeadLink,
} from 'state/document-head/selectors';
import { setLocale } from 'state/ui/language/actions';
import sections from '../../client/sections';
import { createReduxStore } from 'state';
import { getCurrentBranchName, getCurrentCommitShortChecksum } from '../pages/index';
import { generateStaticUrls, staticFilesUrls } from '../pages/static-files';
import { ReduxWrappedLoggedOutLayout } from '../../client/controller/index.node';

import Shell from 'document';
import { enhanceContextWithLogin } from 'login/controller';

const getDefaultContext = () => {
	const calypsoEnv = config( 'env_id' );
	const isDebug = calypsoEnv === 'development';
	const store = createReduxStore( {} );
	const state = store.getState();

	const context = {
		head: {
			title: getDocumentHeadFormattedTitle( state ),
			metas: getDocumentHeadMeta( state ),
			links: getDocumentHeadLink( state ),
		},
		commitSha: process.env.hasOwnProperty( 'COMMIT_SHA' ) ? process.env.COMMIT_SHA : '(unknown)',
		compileDebug: process.env.NODE_ENV === 'development',
		urls: generateStaticUrls(),
		user: false,
		env: calypsoEnv,
		isRTL: config( 'rtl' ),
		isDebug,
		badge: false,
		lang: config( 'i18n_default_locale_slug' ),
		jsFile: 'build',
		faviconURL: '//s1.wp.com/i/favicon.ico',
		isFluidWidth: !! config.isEnabled( 'fluid-width' ),
		abTestHelper: !! config.isEnabled( 'dev/test-helper' ),
		preferencesHelper: !! config.isEnabled( 'dev/preferences-helper' ),
		devDocsURL: '/devdocs',
		store,
		config: config.ssrConfig,
		// enhanced context
		params: {},
	};

	if ( calypsoEnv === 'wpcalypso' ) {
		context.badge = calypsoEnv;
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-wpcalypso.ico';
	}

	if ( calypsoEnv === 'horizon' ) {
		context.badge = 'feedback';
		context.feedbackURL = 'https://horizonfeedback.wordpress.com/';
		context.faviconURL = '/calypso/images/favicons/favicon-horizon.ico';
	}

	if ( calypsoEnv === 'stage' ) {
		context.badge = 'staging';
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-staging.ico';
	}

	if ( calypsoEnv === 'development' ) {
		context.badge = 'dev';
		context.devDocs = true;
		context.feedbackURL = 'https://github.com/Automattic/wp-calypso/issues/';
		context.faviconURL = '/calypso/images/favicons/favicon-development.ico';
		context.branchName = getCurrentBranchName();
		context.commitChecksum = getCurrentCommitShortChecksum();
	}

	const cacheableReduxSubtrees = [ 'documentHead' ];
	context.initialReduxState = pick( state, cacheableReduxSubtrees );

	context.app = {
		isDebug: context.env === 'development' || isDebug,
		staticUrls: staticFilesUrls,
	};

	return context;
};

function renderHTML( component, props ) {
	const doctype = `
<!DOCTYPE html><!--
	<3
	             _
	    ___ __ _| |_   _ _ __  ___  ___
	   / __/ _\` | | | | | '_ \\/ __|/ _ \\
	  | (_| (_| | | |_| | |_) \\__ \\ (_) |
	   \\___\\__,_|_|\\__, | .__/|___/\\___/
	               |___/|_|
-->`;
	return doctype + renderToStaticMarkup( createElement( component, props ) );
}

const renderShell = partial( renderHTML, Shell );

const targetDir = resolve( __dirname, '../../build/shell' );

sections.forEach( section => {
	const context = getDefaultContext();

	if ( config.isEnabled( 'code-splitting' ) ) {
		context.chunk = section.name;
	}

	if ( section.secondary ) {
		context.hasSecondary = true;
	}

	if ( section.group ) {
		context.sectionGroup = section.group;
	}

	if ( section.css ) {
		context.sectionCss = section.css;
	}

	// full page rendering (only login at the moment)
	if (
		section.name === 'login' &&
		config.isEnabled( 'server-side-rendering' ) &&
		isDefaultLocale( context.lang ) &&
		section.isomorphic
	) {
		context.path = '/log-in';
		enhanceContextWithLogin( context );
		context.store.dispatch( setLocale( context.lang || config( 'i18n_default_locale_slug' ) ) );
		const props = {
			store: context.store,
			primary: context.primary,
			secondary: context.secondary,
			redirectUri: context.originalUrl,
		};
		context.renderedLayout = renderToString( createElement( ReduxWrappedLoggedOutLayout, props ) );
	}

	const filename = `${ filenamify( `${ section.name }_${ section.module }`, {
		replacement: '-',
	} ) }.html`;
	const html = renderShell( context );

	writeFile( join( targetDir, filename ), html, () => {
		console.log( `Wrote static shell for ${ section.name } (${ section.module }).` );
	} );
} );
