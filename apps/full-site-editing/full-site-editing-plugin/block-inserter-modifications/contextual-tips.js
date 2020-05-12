/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';
import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import ContextualTip from './contextual-tips/contextual-tip';
import './contextual-tips/style.scss';

const ContextualTips = function () {
	const [ debouncedFilterValue, setFilterValue ] = useState( '' );

	const debouncedSetFilterValue = debounce( setFilterValue, 400 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue, hasItems } ) => {
				if ( hasItems || ! filterValue ) {
					return null;
				}

				if ( debouncedFilterValue !== filterValue ) {
					debouncedSetFilterValue( filterValue );
				}

				return <ContextualTip searchTerm={ filterValue } />;
			} }
		</InserterMenuExtension>
	);
};

// Check if the experimental slot is available before to register plugin.
if ( typeof InserterMenuExtension !== 'undefined' ) {
	registerPlugin( 'block-inserter-contextual-tips', {
		render() {
			return <ContextualTips />;
		},
	} );
}
