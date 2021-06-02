/**
 * External dependencies
 */
import { intersection, isEmpty, keys } from 'lodash';

/**
 * Internal dependencies
 */
import flows from '../flows';
import steps from '../steps';

jest.mock( 'calypso/lib/signup/step-actions', () => ( {} ) );

describe( 'index', () => {
	// eslint-disable-next-line jest/expect-expect
	test( 'should not have overlapping step/flow names', () => {
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
