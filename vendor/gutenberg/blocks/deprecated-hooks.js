/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * WordPress dependencies
 */
import { addAction, addFilter } from '@wordpress/hooks';
import deprecated from '@wordpress/deprecated';

const forwardDeprecatedHooks = ( oldHookName, ...args ) => {
	const deprecatedHooks = [
		'blocks.Autocomplete.completers',
		'blocks.BlockEdit',
		'blocks.BlockListBlock',
		'blocks.MediaUpload',
	];
	if ( includes( deprecatedHooks, oldHookName ) ) {
		const newHookName = oldHookName.replace( 'blocks.', 'editor.' );
		deprecated( `${ oldHookName } filter`, {
			version: '3.3',
			alternative: newHookName,
		} );
		addFilter( newHookName, ...args );
	}
};

addAction( 'hookAdded', 'core/editor/deprecated', forwardDeprecatedHooks );
