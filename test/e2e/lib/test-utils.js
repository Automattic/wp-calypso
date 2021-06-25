export const getTestNameWithTime = ( testName ) => {
	const currentTestName = testName.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const dateTime = new Date().toISOString().split( '.' )[ 0 ].replace( /:/g, '-' );
	return `${ currentTestName }-${ dateTime }`;
};
