import configApi from '@automattic/calypso-config';
import { SITE_SETUP_FLOW, ONBOARDING_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { isInStepContainerV2FlowContext } from '../utils';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'layout/utils', () => {
	describe( 'isInStepContainerV2FlowContext', () => {
		beforeEach( () => {
			// Reset all mocks before each test
			jest.clearAllMocks();

			// Default mock for configApi.isEnabled to return true for step-container-v2
			( configApi.isEnabled as jest.Mock ).mockImplementation( ( feature ) => {
				if ( feature === 'onboarding/step-container-v2' ) {
					return true;
				}
				return false;
			} );
		} );

		describe( 'setup path', () => {
			it( 'should return false when path starts with /setup and flow is a not supported flow', () => {
				const pathname = '/setup/random-flow';
				const query = 'step=step1';
				const result = isInStepContainerV2FlowContext( pathname, query );

				expect( result ).toBe( false );
			} );

			it( 'should return true when path starts with /setup and flow is a supported flow', () => {
				const supportedFlows = [ SITE_SETUP_FLOW, ONBOARDING_FLOW, SITE_MIGRATION_FLOW ];

				supportedFlows.forEach( ( flow ) => {
					const pathname = '/setup/' + flow;
					const query = 'step=step1';
					const result = isInStepContainerV2FlowContext( pathname, query );
					expect( result ).toBe( true );
				} );
			} );

			it( 'should return false when configApi.isEnabled returns false', () => {
				const pathname = '/setup/' + SITE_SETUP_FLOW;
				const query = 'step=step1';
				( configApi.isEnabled as jest.Mock ).mockReturnValue( false );

				const result = isInStepContainerV2FlowContext( pathname, query );

				expect( configApi.isEnabled ).toHaveBeenCalledWith( 'onboarding/step-container-v2' );
				expect( result ).toBe( false );
			} );
		} );

		describe( 'checkout path', () => {
			it( 'should return true when path starts with /checkout and redirect_to is to a StepContainerV2 flow', () => {
				const pathname = '/checkout/site.com';
				const query = 'redirect_to=%2Fsetup%2Fsite-setup';

				const result = isInStepContainerV2FlowContext( pathname, query );

				expect( result ).toBe( true );
			} );

			it( 'should return true when path starts with /checkout and cancel_to is to a StepContainerV2 flow', () => {
				const pathname = '/checkout/site.com';
				const query = 'cancel_to=%2Fsetup%2Fsite-setup';

				const result = isInStepContainerV2FlowContext( pathname, query );

				expect( result ).toBe( true );
			} );

			it( 'should return false when path starts with /checkout but neither redirect_to nor cancel_to is to a StepContainerV2 flow', () => {
				const pathname = '/checkout/site.com';
				const query = 'redirect_to=%2Fsome-path&cancel_to=%2Fother-path';

				const result = isInStepContainerV2FlowContext( pathname, query );

				expect( result ).toBe( false );
			} );
		} );

		describe( 'other paths', () => {
			it( 'should return false for paths that do not start with /setup or /checkout', () => {
				const pathname = '/some-other-path';
				const query = '';

				const result = isInStepContainerV2FlowContext( pathname, query );

				expect( result ).toBe( false );
			} );
		} );
	} );
} );
