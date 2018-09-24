/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from 'state/ui/importers/reducer';
import { IMPORTS_IMPORTER_OPTION_SELECT } from 'state/action-types';

describe( 'reducer.importerOption', () => {
	test( 'should default to null', () => {
		const state = reducer( undefined, {} );

		expect( state.importerOption ).to.eql( null );
	} );

	test(
		'when IMPORTS_IMPORTER_OPTION_SELECT is dispatched ' +
			'it sets importerOption to the importerOption value given',
		() => {
			const importerOption = 'someOption';
			const state = reducer( undefined, {
				type: IMPORTS_IMPORTER_OPTION_SELECT,
				importerOption,
			} );

			expect( state.importerOption ).to.eql( importerOption );
		}
	);
} );
