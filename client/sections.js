/** @format */

/**
 * External dependencies
 */

const fs = require( 'fs' ); // eslint-disable-line import/no-nodejs-modules

/**
 * Internal dependencies
 */
const config = require( 'config' );
const sections = config( 'project' ) === 'wordpress-com' ? require( 'wordpress-com' ) : [];

module.exports = sections.concat();
