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
 * @param {Function} getOptions A function that when called returns an object representing the current options.
 */
export default ( options, getOptionValue, getOptions ) => {
	domReady( () => {
		const current = {};
		const cssVariables = {};
		let previousOptions = {};
		const styleElement = document.createElement( 'style' );
		document.body.appendChild( styleElement );
		options.forEach( option => {
			current[ option ] = null;
			cssVariables[ option ] = `--${ option.replace( '_', '-' ) }`;
		} );

		subscribe( () => {
			let styleProps = '';
			const currentOptions = getOptions();
			if ( isEmpty( currentOptions ) || isEqual( currentOptions, previousOptions ) ) {
				return;
			}
			previousOptions = { ...currentOptions };

			Object.keys( current ).forEach( key => {
				const value = getOptionValue( key );
				if ( ! isEmpty( value ) ) {
					current[ key ] = value;
					styleProps += `${ cssVariables[ key ] }:${ value };`;
				}
			} );
			// We need this to be a stylesheet rather than inline styles
			// so the styles apply to all editor instances incl. previews.
			styleElement.textContent = ! isEmpty( styleProps )
				? `.editor-styles-wrapper{${ styleProps }}`
				: '';
		} );
	} );
};
