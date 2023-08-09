import { intersection, isEmpty, keys } from 'lodash';
import flows from '../flows';
import { getStepModuleMap } from '../step-components';
import steps from '../steps';
import { generateSteps } from '../steps-pure';

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

	test( 'All steps should have the same dependencies provided', () => {
		const stepModuleMap = getStepModuleMap();
		const moduleStepMap = {};
		Object.entries( stepModuleMap ).forEach( ( [ step, module ] ) => {
			if ( ! moduleStepMap[ module ] ) {
				moduleStepMap[ module ] = [];
			}
			moduleStepMap[ module ].push( step );
		} );
		const allStepDefinitions = generateSteps();

		Object.values( moduleStepMap ).forEach( ( moduleRelatedSteps ) => {
			const allDependenciesProvidedForModule = new Set();
			if ( moduleRelatedSteps.length > 1 && allStepDefinitions ) {
				moduleRelatedSteps.forEach( ( step ) => {
					( allStepDefinitions[ step ]?.providesDependencies ?? [] ).forEach( ( d ) =>
						allDependenciesProvidedForModule.add( d )
					);
				} );
				const allDependenciesSortedArray = Array.from( allDependenciesProvidedForModule );
				allDependenciesSortedArray.sort();

				moduleRelatedSteps.forEach( ( step ) => {
					if ( allStepDefinitions[ step ] ) {
						const stepProvidedDependencies = (
							allStepDefinitions[ step ]?.providesDependencies ?? []
						).slice();
						stepProvidedDependencies.sort();

						/***
					 * Not having the same dependencies has been a source of bugs in the signup framework

					 * - p1691481660481399-slack-C04U5A26MJB
					 * - p1689619382168349-slack-C02FMH4G8
					 * - https://github.com/Automattic/wp-calypso/pull/17523
					 *
					 * Where the flow would fail in production. This tests makes sure that any change that introduces a dependency
					 * is also introduced in all linked steps to a given module.
					 * Eg: if a dependency was added to the `domain-only` step, then then same dependency
					 * needs to be added to all steps that are linked by the module `domains` ( as mapped in `calypso/signup/config/step-components` ).
					 * This dependency can be added as an optionalDependency if the dependency is provided conditionally
					 */
						// eslint-disable-next-line jest/no-conditional-expect
						expect( { step, deps: stepProvidedDependencies } ).toEqual( {
							step,
							deps: allDependenciesSortedArray,
						} );
					}
				} );
			}
		} );
	} );
} );
