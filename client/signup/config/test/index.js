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

	/***
	 * Not having the same dependencies has been a source of bugs in the signup framework, where the flow would fail in production.
	 * - p1691481660481399-slack-C04U5A26MJB
	 * - p1689619382168349-slack-C02FMH4G8
	 * - https://github.com/Automattic/wp-calypso/pull/17523
	 *
	 * This tests makes sure that any change that introduces a dependency
	 * is also introduced in all linked steps to a given module.
	 * Eg: if a dependency was added to the `domain-only` step, then then same dependency
	 * needs to be added to all steps that are linked by the module `domains` ( as mapped in `calypso/signup/config/step-components` ).
	 * This dependency can be added as an optionalDependency if the dependency is provided conditionally
	 */
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

		Object.values( moduleStepMap )
			.filter( ( moduleRelatedSteps ) => moduleRelatedSteps.length > 1 )
			.forEach( ( moduleRelatedSteps ) => {
				/**
				 * Filter out a unique list of all dependencies
				 * provided by all steps that are linked to a module
				 */
				let allDependenciesProvidedForModule = new Set();
				moduleRelatedSteps.forEach( ( step ) => {
					( allStepDefinitions[ step ]?.providesDependencies ?? [] ).forEach( ( d ) =>
						allDependenciesProvidedForModule.add( d )
					);
				} );
				allDependenciesProvidedForModule = Array.from( allDependenciesProvidedForModule );

				/**
				 * Go over all steps that are linked to a module
				 * and make sure that they all provide the same dependencies
				 */
				moduleRelatedSteps
					.filter( ( step ) => allStepDefinitions[ step ]?.providesDependencies )
					.forEach( ( step ) => {
						const stepProvidedDependencies = allStepDefinitions[ step ].providesDependencies;

						expect( { step, deps: stepProvidedDependencies } ).toEqual( {
							step,
							deps: expect.arrayContaining( allDependenciesProvidedForModule ),
						} );
					} );
			} );
	} );
} );
