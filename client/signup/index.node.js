import { getLanguage, getLanguageRouteParam } from '@automattic/i18n-utils';
import { setDocumentHeadMeta } from 'calypso/state/document-head/actions';
import { getDocumentHeadMeta } from 'calypso/state/document-head/selectors';

export default function ( router ) {
	const lang = getLanguageRouteParam();

	router(
		[
			`/start/${ lang }`,
			`/start/:flowName/${ lang }`,
			`/start/:flowName/:stepName/${ lang }`,
			`/start/:flowName/:stepName/:stepSectionName/${ lang }`,
		],
		setUpLocale,
		setupMetaTags
	);
}

// Set up the locale if there is one
function setUpLocale( context, next ) {
	const language = getLanguage( context.params.lang );
	if ( language ) {
		context.lang = context.params.lang;
	}

	next();
}

// Set up meta tags.
function setupMetaTags( context, next ) {
	// All `/start/*` sub-pages should be noindex. See 3065-gh-Automattic/martech.
	if ( ! /^\/start\/?$/.test( context.pathname ) ) {
		const meta = getDocumentHeadMeta( context.store.getState() ).concat( {
			name: 'robots',
			content: 'noindex',
		} );
		context.store.dispatch( setDocumentHeadMeta( meta ) );
	}

	next();
}
