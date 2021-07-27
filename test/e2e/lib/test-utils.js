import path from 'path';

const BASE_PATH = process.env.TEMP_ASSET_PATH || path.join( __dirname, '..' );

export const generatePath = ( name ) => path.join( BASE_PATH, name );

export const getTestNameWithTime = ( testName ) => {
	const currentTestName = testName.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	return `${ currentTestName }-${ dateTime }`;
};
