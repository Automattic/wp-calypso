/**
 * External dependencies
 */
import { subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';

/**
 * DOM updater
 *
 * @param {string[]} options A list of option names to keep track of.
 * @param {Function} getOptionValue A function that given an option name as a string, returns the current option value.
 */
export default ( options, getOptionValue ) => {
	domReady( () => {
		const current = {};
		const cssVariables = {};
		options.forEach( option => {
			current[ option ] = null;
			cssVariables[ option ] = `--${ option.replace( /_/g, '-' ) }`;
		} );

		subscribe( () => {
			Object.keys( current ).forEach( key => {
				const value = getOptionValue( key );
				if ( current[ key ] !== value ) {
					current[ key ] = value;
					// We want to scope this to the root node of the editor.
					const node = document.getElementsByClassName( 'editor-styles-wrapper' )[ 0 ];
					if ( node ) {
						node.style.setProperty( cssVariables[ key ], value );
					}
				}
			} );
		} );
	} );
};
