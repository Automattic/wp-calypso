/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	canResumeFlow,
	getCompletedSteps,
	getValueFromProgressStore,
	getValidPath,
	getStepName,
	getFlowName,
	getFilteredSteps,
} from '../utils';
import flows from 'signup/config/flows';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'lib/user', () => () => ( {
	get: () => {},
} ) );

jest.mock( 'signup/config/flows-pure', () => ( {
	generateFlows: () => require( './fixtures/flows' ),
} ) );

describe( 'utils', () => {
	const defaultFlowName = flows.defaultFlowName;

	describe( 'getStepName', () => {
		test( 'should find the step name in either the stepName or flowName fragment', () => {
			expect( getStepName( { stepName: 'user' } ) ).toBe( 'user' );
			expect( getStepName( { flowName: 'user' } ) ).toBe( 'user' );
		} );

		test( 'should return undefined if no step name is found', () => {
			expect( getStepName( { flowName: 'account' } ) ).toBeUndefined();
		} );
	} );

	describe( 'getFlowName', () => {
		test( 'should find the flow name in the flowName fragment if present', () => {
			expect( getFlowName( { flowName: 'other' } ) ).toBe( 'other' );
		} );

		test( 'should return the default flow if the flow is missing', () => {
			expect( getFlowName( {} ) ).toBe( defaultFlowName );
		} );
	} );

	describe( 'getFilteredSteps', () => {
		describe( 'when the given flow is found in the config', () => {
			const exampleFlowName = 'onboarding';

			describe( 'when there are a number of steps in the progress state', () => {
				describe( 'and some of them match that flow', () => {
					const userStep = { stepName: 'user' };
					const siteTypeStep = { stepName: 'site-type' };
					const someOtherStep = { stepName: 'some-other-step' };
					const exampleSteps = {
						user: userStep,
						'site-type': siteTypeStep,
						'some-other-step': someOtherStep,
					};

					const result = getFilteredSteps( exampleFlowName, exampleSteps );

					test( 'it returns an array', () => {
						expect( Array.isArray( result ) ).toBe( true );
					} );

					test( 'it should return only the step objects that match the flow', () => {
						expect( result ).toEqual( [ userStep, siteTypeStep ] );
					} );
				} );

				describe( 'but none of them match that flow', () => {
					const exampleSteps = {
						'some-step': { stepName: 'some-step' },
						'some-other-step': { stepName: 'some-other-step' },
					};
					const result = getFilteredSteps( exampleFlowName, exampleSteps );

					test( 'it should return an empty array', () => {
						expect( result ).toHaveLength( 0 );
						expect( Array.isArray( result ) ).toBe( true );
					} );
				} );
			} );

			describe( 'when there are no steps in the progress state', () => {
				const result = getFilteredSteps( exampleFlowName, {} );

				test( 'it should return an empty array', () => {
					expect( result ).toHaveLength( 0 );
					expect( Array.isArray( result ) ).toBe( true );
				} );
			} );
		} );

		describe( 'when the given flow is not found in the config', () => {
			const exampleFlowName = 'some-bad-flow';
			const exampleSteps = {
				user: { stepName: 'user' },
				'site-type': { stepName: 'site-type' },
			};
			const result = getFilteredSteps( exampleFlowName, exampleSteps );

			test( 'it should return an empty array', () => {
				expect( result ).toHaveLength( 0 );
				expect( Array.isArray( result ) ).toBe( true );
			} );
		} );
	} );

	describe( 'getValidPath', () => {
		test( 'should redirect to the default if no flow is present', () => {
			expect( getValidPath( {} ) ).toBe( '/start/user' );
		} );

		test( 'should redirect to the current flow default if no step is present', () => {
			expect( getValidPath( { flowName: 'account' } ) ).toBe( '/start/account/user' );
		} );

		test( 'should redirect to the default flow if the flow is the default', () => {
			expect( getValidPath( { flowName: defaultFlowName } ) ).toBe( '/start/user' );
		} );

		test( 'should redirect invalid steps to the default flow if no flow is present', () => {
			expect(
				getValidPath( {
					flowName: 'foo',
					lang: 'fr',
				} )
			).toBe( '/start/user/fr' );
		} );

		test( 'should preserve a step section name and redirect to the default flow', () => {
			expect(
				getValidPath( {
					flowName: 'foo',
					stepName: 'abc',
					lang: 'fr',
				} )
			).toBe( '/start/user/abc/fr' );
		} );

		test( 'should redirect missing steps to the current flow default', () => {
			expect(
				getValidPath( {
					flowName: 'account',
					lang: 'fr',
				} )
			).toBe( '/start/account/user/fr' );
		} );

		test( 'should handle arbitrary step section names', () => {
			const randomStepSectionName = 'random-step-section-' + Math.random();

			expect(
				getValidPath( {
					flowName: 'account',
					stepName: 'user',
					stepSectionName: randomStepSectionName,
					lang: 'fr',
				} )
			).toBe( `/start/account/user/${ randomStepSectionName }/fr` );
		} );

		test( 'should handle arbitrary step section names in the default flow', () => {
			const randomStepSectionName = 'random-step-section-' + Math.random();

			expect(
				getValidPath( {
					stepName: 'user',
					stepSectionName: randomStepSectionName,
					lang: 'fr',
				} )
			).toBe( `/start/user/${ randomStepSectionName }/fr` );
		} );
	} );

	describe( 'getValueFromProgressStore', () => {
		const signupProgress = [ { stepName: 'empty' }, { stepName: 'site', site: 'calypso' } ];
		const config = {
			stepName: 'site',
			fieldName: 'site',
			signupProgress,
		};

		test( 'should return the value of the field if it exists', () => {
			expect( getValueFromProgressStore( config ) ).toBe( 'calypso' );
		} );

		test( 'should return null if the field is not present', () => {
			delete signupProgress[ 1 ].site;
			expect( getValueFromProgressStore( config ) ).toBeUndefined();
		} );
	} );

	describe( 'getCompletedSteps', () => {
		const mixedFlowsSignupProgress = [
			{ stepName: 'user', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'site-type', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'site-topic', lastKnownFlow: 'onboarding-blog', status: 'completed' },
			{ stepName: 'site-title', lastKnownFlow: 'onboarding-blog', status: 'completed' },
			{ stepName: 'domains', lastKnownFlow: 'onboarding-blog', status: 'pending' },
			{ stepName: 'plans', lastKnownFlow: 'onboarding-blog', status: 'pending' },
		];
		const singleFlowSignupProgress = [
			{ stepName: 'user', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'site-type', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'site-topic-with-preview', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'site-title-with-preview', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'site-style-with-preview', lastKnownFlow: 'onboarding', status: 'completed' },
			{ stepName: 'domains-with-preview', lastKnownFlow: 'onboarding', status: 'pending' },
			{ stepName: 'plans', lastKnownFlow: 'onboarding', status: 'pending' },
		];

		test( 'step names should match steps of a particular flow given progress with mixed flows', () => {
			const completedSteps = getCompletedSteps( 'onboarding-blog', mixedFlowsSignupProgress );
			const stepNames = completedSteps.map( ( step ) => step.stepName );

			expect( stepNames ).toStrictEqual( flows.getFlow( 'onboarding-blog' ).steps );
		} );

		test( 'should not match steps of a flow given progress with mixed flows and `shouldMatchFlowName` flag', () => {
			const completedSteps = getCompletedSteps( 'onboarding-blog', mixedFlowsSignupProgress, {
				shouldMatchFlowName: true,
			} );
			const filteredOnboardingBlogSteps = mixedFlowsSignupProgress.filter(
				( step ) => step.lastKnownFlow === 'onboarding-blog'
			);
			const stepNames = completedSteps.map( ( step ) => step.stepName );

			expect( stepNames ).not.toStrictEqual( flows.getFlow( 'onboarding-blog' ).steps );
			expect( completedSteps ).toStrictEqual( filteredOnboardingBlogSteps );
		} );

		test( 'should match steps of a flow given progress with single flow and `shouldMatchFlowName` flag', () => {
			const completedSteps = getCompletedSteps( 'onboarding', singleFlowSignupProgress, {
				shouldMatchFlowName: true,
			} );
			const stepNames = completedSteps.map( ( step ) => step.stepName );

			expect( stepNames ).toStrictEqual( flows.getFlow( 'onboarding' ).steps );
			expect( completedSteps ).toStrictEqual( singleFlowSignupProgress );
		} );
	} );

	describe( 'canResumeFlow', () => {
		test( 'should return true when given flow matches progress state', () => {
			const signupProgress = [ { stepName: 'site-type', lastKnownFlow: 'onboarding' } ];
			const canResume = canResumeFlow( 'onboarding', signupProgress );

			expect( canResume ).toBe( true );
		} );

		test( 'should return false when given flow does not match progress state', () => {
			const signupProgress = [ { stepName: 'site-type', lastKnownFlow: 'onboarding' } ];
			const canResume = canResumeFlow( 'onboarding-blog', signupProgress );

			expect( canResume ).toBe( false );
		} );

		test( 'should return false when flow sets disallowResume', () => {
			const signupProgress = [ { stepName: 'site-type', lastKnownFlow: 'disallow-resume' } ];
			const canResume = canResumeFlow( 'disallow-resume', signupProgress );

			expect( canResume ).toBe( false );
		} );

		test( 'should return false when progress state is empty', () => {
			const signupProgress = [];
			const canResume = canResumeFlow( 'onboarding', signupProgress );

			expect( canResume ).toBe( false );
		} );
	} );
} );
