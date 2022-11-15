/**
 * The loader parses a config file and filters out the keys needed by the app, so that we don't exopse the whole config file.
 *
 * @param {*} source Content of source file.
 * @returns filtered content of source file.
 */
export default function loader( source ) {
	const sourceObject = JSON.parse( source );
	const targetObject = {};
	const options = this.getOptions();
	if ( options.keys && options.keys.length > 0 ) {
		let key;
		for ( key of options.keys ) {
			targetObject[ key ] = sourceObject[ key ];
		}
	}

	return `export default ${ JSON.stringify( targetObject ) }`;
}
