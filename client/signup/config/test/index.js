import { intersection, isEmpty, keys } from 'lodash';
import flows from '../flows';
import { generateFlows } from '../flows-pure';
import { getStepModuleMap } from '../step-components';
import steps from '../steps';
import { generateSteps } from '../steps-pure';

jest.mock( 'calypso/lib/signup/step-actions', () => ( {} ) );
jest.mock( 'component-file-picker', () => <div></div> );
jest.mock( 'calypso/lib/explat', () => {
	() => {
		return [ false, null ];
	};
} );
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => true,
} ) );

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

	test( 'All step components should have a step definition', () => {
		const stepModuleMap = getStepModuleMap();
		const stepNames = new Set( Object.keys( stepModuleMap ) );
		const allStepDefinitions = generateSteps();

		stepNames.forEach( ( stepName ) => {
			expect( allStepDefinitions ).toHaveProperty( stepName );
		} );
	} );

	test( 'All step components should have a step implementation', async () => {
		const stepModuleMap = getStepModuleMap();
		const allModules = new Set( Object.values( stepModuleMap ) );
		const nonExistentModules = [];
		await Promise.all(
			Array.from( allModules ).map( async ( module ) => {
				const path = `calypso/signup/steps/${ module }`;
				try {
					await import( path );
				} catch ( e ) {
					if ( e.message.includes( 'Cannot find module' ) ) {
						console.error( e );
						nonExistentModules.push( path );
					}
				}
			} )
		);

		expect( nonExistentModules ).toEqual( [] );
	} );

	/**
	 * Before cleaning up a step, make sure to investigate if the step is 'phantom' submitted inside another step.
	 * Steps can be submitted without a step component or it being included in a flow.
	 * Eg: https://github.com/Automattic/wp-calypso/pull/81778
	 */
	test( 'All step definitions should have a step component mapping', () => {
		const stepModuleMap = getStepModuleMap();
		const allStepDefinitions = generateSteps();
		Object.keys( allStepDefinitions ).forEach( ( stepName ) => {
			expect( stepModuleMap ).toHaveProperty( stepName );
		} );
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
	 *
	 * Read more: p4TIVU-aK6-p2
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

	test( 'there should be no unused steps', () => {
		const flowDefinitions = generateFlows();
		const allStepDefinitions = generateSteps();
		const definedSteps = new Set( Object.keys( allStepDefinitions ) );

		Object.values( flowDefinitions ).forEach( ( flow ) => {
			flow.steps.forEach( ( step ) => definedSteps.delete( step ) );
		} );

		// Remove the `site` step manually since it is used in tests.
		definedSteps.delete( 'site' );

		// Do not consider the user step as deprecated since there is still a config flag
		// deciding whether user-social or user is used.
		definedSteps.delete( 'user' );

		expect( definedSteps ).toEqual( new Set() );
	} );
} );
