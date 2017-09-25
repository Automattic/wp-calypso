/**
 * External dependencies
 */
import fs from 'fs';

import path from 'path';

/**
 * Internal dependencies
 */
import config from 'config';

const sections = require( config( 'project' ) );
import extensions from 'extensions';

const extensionSections = extensions.map( extension => {
	try {
		const pkg = JSON.parse( fs.readFileSync( path.join( __dirname, 'extensions', extension, 'package.json' ) ) );

		return Object.assign( {}, pkg.section, { envId: pkg.env_id } );
	} catch ( e ) {
		return null;
	}
} );

sections.push( {
	name: 'devdocs',
	paths: [ '/devdocs' ],
	module: 'devdocs',
	secondary: true,
	enableLoggedOut: true
} );

sections.push( {
	name: 'devdocs',
	paths: [ '/devdocs/start' ],
	module: 'devdocs',
	secondary: false,
	enableLoggedOut: true
} );

export default sections.concat( extensionSections.filter( Boolean ) );
