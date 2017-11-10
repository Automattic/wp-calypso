/** @format */
/* eslint-disable no-console */

let warn;

if ( process.env.NODE_ENV === 'development' ) {
	warn = ( ...args ) => console.warn( ...args );
} else {
	warn = () => {};
}

export default warn;
