/**
 * External dependencies
 */
import { intersection, isEmpty, keys } from 'lodash';

/**
 * Internal dependencies
 */
import flows from '../flows';
import steps from '../steps';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'lib/signup/step-actions', () => ( {} ) );
jest.mock( 'lib/user', () => () => {
	return {
		get() {
			return {};
		},
	};
} );
jest.mock( 'config', () => ( {
	isEnabled: () => true,
} ) );

describe( 'Signup config steps', () => {
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

	// eslint-disable-next-line jest/expect-expect
	test( 'Should not have unused steps configured', () => {
		const activeSteps = Object.values( flows.getFlows() )
			.flatMap( ( { steps: stepsArray } ) => stepsArray )
			.filter( ( value, index, self ) => {
				return self.indexOf( value ) === index;
			} );

		const deadSteps = Object.entries( steps )
			.map( ( [ stepKey ] ) => stepKey )
			.filter( ( stepName ) => ! activeSteps.includes( stepName ) );

		if ( deadSteps.length > 0 ) {
			throw new Error(
				`The following steps do not appear in any flow: ${ JSON.stringify( deadSteps, null, 2 ) }`
			);
		}
	} );
} );
