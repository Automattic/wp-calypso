import { SITE_SETUP_FLOW, ONBOARDING_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { isInStepContainerV2FlowContext, getStepperFlowFromContext } from '../utils';

describe( 'layout/utils', () => {
	describe( 'isInStepContainerV2FlowContext', () => {
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

	describe( 'getStepperFlowFromContext', () => {
		it( 'should return the flow from the URL when path starts with /setup', () => {
			const pathname = '/setup/' + SITE_MIGRATION_FLOW;
			const query = 'step=step1';

			const result = getStepperFlowFromContext( pathname, query );

			expect( result ).toBe( SITE_MIGRATION_FLOW );
		} );

		it( 'should return the flow inferred from redirect_to when path starts with /checkout', () => {
			const pathname = '/checkout/site.com';
			const query = 'redirect_to=%2Fsetup%2F' + SITE_SETUP_FLOW;

			const result = getStepperFlowFromContext( pathname, query );

			expect( result ).toBe( SITE_SETUP_FLOW );
		} );

		it( 'should return the flow inferred from cancel_to when path starts with /checkout and redirect_to has no flow', () => {
			const pathname = '/checkout/site.com';
			const query = 'redirect_to=%2Fsome-path&cancel_to=%2Fsetup%2F' + ONBOARDING_FLOW;

			const result = getStepperFlowFromContext( pathname, query );

			expect( result ).toBe( ONBOARDING_FLOW );
		} );

		it( 'should return an empty string when path starts with /checkout but neither redirect_to nor cancel_to has a flow', () => {
			const pathname = '/checkout/site.com';
			const query = 'redirect_to=%2Fsome-path&cancel_to=%2Fother-path';

			const result = getStepperFlowFromContext( pathname, query );

			expect( result ).toBe( '' );
		} );

		it( 'should return an empty string for paths that do not start with /setup or /checkout', () => {
			const pathname = '/some-other-path';
			const query = '';

			const result = getStepperFlowFromContext( pathname, query );

			expect( result ).toBe( '' );
		} );
	} );
} );
