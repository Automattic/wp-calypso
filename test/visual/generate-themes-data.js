// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' );
const request = require( 'request' );

const url = 'https://public-api.wordpress.com/rest/v1/nux/starter-designs/';
request( url ).pipe( fs.createWriteStream( './test/visual/themesData.json' ) );
