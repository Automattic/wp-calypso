/** @format */
/**
 * Given a string, attempts to generate the equivalent HTMLElement
 *
 * @param  {string}      string HTML string
 * @return {HTMLElement}        Element object representing string
 */
export default function( string ) {
	let wrapper;
	if ( document.implementation && document.implementation.createHTMLDocument ) {
		wrapper = document.implementation.createHTMLDocument( '' ).body;
	} else if ( 'undefined' !== typeof DOMParser ) {
		try {
			return new DOMParser().parseFromString( string, 'text/html' ).body.firstChild;
		} catch ( e ) {} // eslint-disable-line no-empty
	}

	wrapper = wrapper || document.createElement( 'div' );
	wrapper.innerHTML = string;
	return wrapper.firstChild;
}
