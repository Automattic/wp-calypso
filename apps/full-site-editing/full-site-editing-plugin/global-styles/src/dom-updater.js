/**
 * External dependencies
 */
import { subscribe, select } from '@wordpress/data';
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
		// Book-keeping.
		const currentOptions = {};
		let previousOptions = {};
		const cssVariables = {};
		options.forEach( ( option ) => {
			cssVariables[ option ] = `--${ option.replace( '_', '-' ) }`;
		} );

		let styleElement = null;
		subscribe( () => {
			/**
			 * Do nothing until the editor is ready. This is required when
			 * working in wpcom iframe environment to avoid running code before
			 * everything has loaded, which can cause bugs like the following.
			 *
			 * @see https://github.com/Automattic/wp-calypso/pull/40690
			 */
			const isEditorReady = select( 'core/editor' ).__unstableIsEditorReady;
			if ( isEditorReady && isEditorReady() === false ) {
				return;
			}

			// Create style element if it has not been created yet. Must happen
			// after the editor is ready or the style element will be appended
			// before the styles it needs to affect.
			if ( ! styleElement ) {
				styleElement = document.createElement( 'style' );
				document.body.appendChild( styleElement );
			}

			// Maybe bail-out early.
			options.forEach( ( option ) => {
				currentOptions[ option ] = getOptionValue( option );
			} );
			if ( isEmpty( currentOptions ) || isEqual( currentOptions, previousOptions ) ) {
				return;
			}
			previousOptions = { ...currentOptions };

			// Update style node. We need this to be a stylesheet rather than inline styles
			// so the styles apply to all editor instances incl. previews.
			let declarationList = '';
			Object.keys( currentOptions ).forEach( ( key ) => {
				declarationList += `${ cssVariables[ key ] }:${ currentOptions[ key ] };`;
			} );
			styleElement.textContent = `.editor-styles-wrapper{${ declarationList }}`;
		} );
	} );
};
