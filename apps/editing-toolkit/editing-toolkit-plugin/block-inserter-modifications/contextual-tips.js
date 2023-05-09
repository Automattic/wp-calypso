import {
	__unstableInserterMenuExtension,
	__experimentalInserterMenuExtension,
} from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { debounce } from 'lodash';
import ContextualTip from './contextual-tips/contextual-tip';

import './contextual-tips/style.scss';

// InserterMenuExtension has been made unstable in this PR: https://github.com/WordPress/gutenberg/pull/31417 / Gutenberg v10.7.0-rc.1.
// We need to support both symbols until we're sure Gutenberg < v10.7.x is not used anymore in WPCOM.
const InserterMenuExtension =
	typeof __unstableInserterMenuExtension !== 'undefined'
		? __unstableInserterMenuExtension
		: __experimentalInserterMenuExtension;

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
