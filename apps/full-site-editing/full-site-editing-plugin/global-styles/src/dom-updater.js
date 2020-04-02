/**
 * External dependencies
 */
import { subscribe } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { isEmpty, isEqual } from 'lodash';

/**
 * DOM updater
 *
 * @param {string[]} options A list of option names to keep track of.
 * @param {Function} getOptionValue A function that given an option name as a string, returns the current option value.
 */
export default ( options, getOptionValue ) => {
	domReady( () => {
		// Create style node.
		const styleElement = document.createElement( 'style' );
		document.body.appendChild( styleElement );

		// Book-keeping.
		const currentOptions = {};
		let previousOptions = {};
		const cssVariables = {};
		options.forEach( option => {
			cssVariables[ option ] = `--${ option.replace( '_', '-' ) }`;
		} );

		subscribe( () => {
			// Maybe bail-out early.
			options.forEach( option => {
				currentOptions[ option ] = getOptionValue( option );
			} );
			if ( isEmpty( currentOptions ) || isEqual( currentOptions, previousOptions ) ) {
				return;
			}
			previousOptions = { ...currentOptions };

			// Update style node. We need this to be a stylesheet rather than inline styles
			// so the styles apply to all editor instances incl. previews.
			let declarationList = '';
			Object.keys( currentOptions ).forEach( key => {
				declarationList += `${ cssVariables[ key ] }:${ currentOptions[ key ] };`;
			} );
			styleElement.textContent = `.editor-styles-wrapper{${ declarationList }}`;
		} );
	} );
};
