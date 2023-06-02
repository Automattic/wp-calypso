/**
 * @jest-environment jsdom
 */
import flows from 'calypso/signup/config/flows';
import mockedFlows from './fixtures/flows';

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		beforeAll( () => {
			jest.spyOn( flows, 'getFlows' ).mockReturnValue( mockedFlows );
		} );

		test( 'should return the full flow when the user is not logged in', () => {
			expect( flows.getFlow( 'main', false ).steps ).toEqual( [ 'user', 'site' ] );
		} );

		test( 'should remove the user step from the flow when the user is logged in', () => {
			expect( flows.getFlow( 'main', true ).steps ).toEqual( [ 'site' ] );
		} );
	} );

	describe( 'excludeSteps', () => {
		beforeAll( () => {
			jest.spyOn( flows, 'getFlows' ).mockReturnValue( mockedFlows );
		} );

		afterAll( () => {
			flows.excludeStep();
		} );

		test( 'should exclude site step from getFlow', () => {
			flows.excludeStep( 'site' );
			expect( flows.getFlow( 'main', false ).steps ).toEqual( [ 'user' ] );
		} );
	} );
} );
