/* eslint no-console: [ 'error', { allow: [ 'error' ] } ] */

/**
 * WordPress dependencies
 */
import { select, dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './store';
import './examples';

export function registerExample( slug, settings ) {
    settings = { ...settings, slug };

    if ( select( 'muriel/examples' ).getExample( slug ) ) {
        console.error('Example "' + slug + '" is already registered.');
    }

    dispatch( 'muriel/examples' ).addExamples( settings );

    return settings;
}

