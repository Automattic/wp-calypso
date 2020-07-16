/**
 * Internal dependencies
 */
import config from 'config';
import sanitize from 'server/sanitize';
import wooDnaConfig from 'jetpack-connect/woo-dna-config';
import isWCComConnect from './is-wccom-connect';
import reduxStore from './redux-store';
import devInfo from './dev-info';
import lang from './lang';
import badge from './badge';
import app from './app';

export default ( calypsoEnv ) => ( req, res, next ) => {
	req.setDefaultContext = ( entrypoint = 'entry-main' ) => {
		const target = req.getTarget();

		req.context = {
			...req.context,

			compileDebug: process.env.NODE_ENV === 'development',
			user: false,
			env: calypsoEnv,
			sanitize,
			requestFrom: req.query.from,
			isWooDna: wooDnaConfig( req.query ).isWooDnaFlow(),
			entrypoint: req.getFilesForEntrypoint( entrypoint ),
			manifest: req.getAssets().manifests.manifest,
			faviconURL: config( 'favicon_url' ),
			devDocsURL: '/devdocs',
			bodyClasses: [],
			addEvergreenCheck: target === 'evergreen' && calypsoEnv !== 'development',
			target: target || 'fallback',
			devDocs: Boolean( calypsoEnv === 'wpcalypso' || calypsoEnv === 'development' ),

			...app( req, calypsoEnv ),
			...badge( calypsoEnv ),
			...lang( req ),
			...reduxStore( req ),
			...isWCComConnect( req ),
			...devInfo( req, calypsoEnv ),
		};
	};

	next();
};
