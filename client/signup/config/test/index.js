/** @format */
/**
 * External dependencies
 */
import { intersection, isEmpty, keys } from 'lodash';

/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useMockery from 'test/helpers/use-mockery';

describe( 'index', () => {
	let flows, steps;

	useFilesystemMocks( __dirname );
	useMockery( mockery => {
		mockery.registerMock( 'lib/abtest', {
			abtest: () => '',
		} );
		flows = require( '../flows' );
		steps = require( '../steps' );
	} );

	it( 'should not have overlapping step/flow names', () => {
		const overlappingNames = intersection( keys( steps ), keys( flows.getFlows() ) );

		if ( ! isEmpty( overlappingNames ) ) {
			throw new Error(
				'Step and flow names must be unique. The following names are used as both step and flow names: [' +
					overlappingNames +
					'].'
			);
		}
	} );
} );
