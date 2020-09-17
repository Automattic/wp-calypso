/**
 * External dependencies
 */
import { intersection, isEmpty, keys } from 'lodash';

/**
 * Internal dependencies
 */
import flows from '../flows';
import steps from '../steps';
import { stepNameToModuleName } from '../step-components';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'lib/signup/step-actions', () => ( {} ) );
jest.mock( 'config', () => ( {
	isEnabled: () => true,
} ) );

jest.mock( 'lib/user', () => () => {
	return {
		get() {
			return {};
		},
	};
} );

describe( 'index', () => {
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

describe( 'Delete this', () => {
	test( 'Show effected flow for steps', () => {
		// var steps =>  'client/signup/config/steps' ;
		// var flows =>  'client/signup/config/flows' ;
		// var stepNameToModuleName => 'client/signup/config/step-components' ;

		const stepsAffected = [ 'domains' ];
		const ignoredFlows = [
			'main',
			'design-first',
			'test-fse',
			'ecommerce-design-first',
			'ecommerce-onboarding',
			'onboarding-registrationless',
			'onboarding-plan-first',
			'onboarding-with-preview',
		];
		const activeFlows = Object.entries( flows.getFlows() )
			.filter( ( [ flow ] ) => ! ignoredFlows.includes( flow ) )
			.reduce( ( acc, [ flowKey, flow ] ) => {
				acc[ flowKey ] = flow;
				return acc;
			}, {} );

		const stepWiseAffectedFlows = [];

		stepsAffected.forEach( ( affectedStep ) => {
			const hayStackAliasList = Object.entries( stepNameToModuleName )
				.filter( ( [ , stepActual ] ) => stepActual === affectedStep )
				.map( ( [ stepAlias ] ) => stepAlias );

			const affectedFlows = Object.entries( activeFlows )
				.filter( ( [ , { steps: stepsArray } ] ) =>
					stepsArray.some( ( needle ) => hayStackAliasList.includes( needle ) )
				)
				.map( ( [ flow, { description, steps: flowSteps } ] ) => ( {
					flow,
					description,
					steps: flowSteps,
				} ) );

			stepWiseAffectedFlows.push( {
				hayStackAliasList,
				affectedStep,
				affectedFlows,
			} );
		} );

		// eslint-disable-next-line no-console
		console.log( JSON.stringify( stepWiseAffectedFlows, null, 2 ) );
	} );
} );
