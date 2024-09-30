import { getLanguage, getLanguageRouteParam } from '@automattic/i18n-utils';
import defaultI18n from 'i18n-calypso';
import { ssrSetupLocale } from 'calypso/controller';
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
		ssrSetupLocale,
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
	const i18n = context.i18n || defaultI18n;
	const translate = i18n.translate.bind( i18n );

	/**
	 * Get the meta tags, excluding `description` and `robots` meta items.
	 */
	const meta = getDocumentHeadMeta( context.store.getState() ).filter(
		( { name } ) => name !== 'description' && name !== 'robots'
	);

	meta.push( {
		name: 'description',
		content: translate(
			'Sign up for a free WordPress.com account to start building your new website. Get access to powerful tools and customizable designs to bring your ideas to life.'
		),
	} );

	// All `/start/*` sub-pages should be noindex. See 3065-gh-Automattic/martech.
	if ( ! /^\/start\/?$/.test( context.pathname ) ) {
		meta.push( {
			name: 'robots',
			content: 'noindex',
		} );
	}

	context.store.dispatch( setDocumentHeadMeta( meta ) );
	next();
}
