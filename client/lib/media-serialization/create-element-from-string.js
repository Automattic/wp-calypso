/** @format */

/**
 * Internal dependencies
 */
import { domForHtml } from 'lib/post-normalizer/utils';

/**
 * Given a string, attempts to generate the equivalent HTMLElement
 *
 *
 * @format
 * @param {string}      string HTML string
 * @return {HTMLElement}        Element object representing string
 */

export default function( string ) {
	let wrapper;
	if ( document.implementation && document.implementation.createHTMLDocument ) {
		wrapper = document.implementation.createHTMLDocument( '' ).body;
	} else {
		try {
			return domForHtml( string ).firstChild;
		} catch ( e ) {} // eslint-disable-line no-empty
	}

	wrapper = wrapper || document.createElement( 'div' );
	wrapper.innerHTML = string;
	return wrapper.firstChild;
}
