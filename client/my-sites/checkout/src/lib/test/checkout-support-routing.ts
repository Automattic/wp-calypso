import { loadExperimentAssignment } from 'calypso/lib/explat';
import {
	CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS,
	CHECKOUT_SUPPORT_EXPERIMENT,
	loadCheckoutSupportAssignment,
} from '../checkout-support-routing';

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
} ) );

const mockLoadExperimentAssignment = loadExperimentAssignment as jest.MockedFunction<
	typeof loadExperimentAssignment
>;

const assignment = ( variationName: string | null ) => ( {
	experimentName: CHECKOUT_SUPPORT_EXPERIMENT,
	variationName,
	retrievedTimestamp: 0,
	ttl: 60,
} );

describe( 'loadCheckoutSupportAssignment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'returns the variation the user is assigned to', async () => {
		mockLoadExperimentAssignment.mockResolvedValue( assignment( 'human_only' ) );

		await expect( loadCheckoutSupportAssignment() ).resolves.toEqual( {
			variation: 'human_only',
			timedOut: false,
			durationMs: expect.any( Number ),
		} );
		expect( mockLoadExperimentAssignment ).toHaveBeenCalledWith(
			'calypso_checkout_support_routing'
		);
	} );

	it( 'returns no variation when the user is not in the experiment', async () => {
		mockLoadExperimentAssignment.mockResolvedValue( assignment( null ) );

		await expect( loadCheckoutSupportAssignment() ).resolves.toMatchObject( {
			variation: undefined,
			timedOut: false,
		} );
	} );

	it( 'ignores variations it does not know', async () => {
		mockLoadExperimentAssignment.mockResolvedValue( assignment( 'treatment' ) );

		await expect( loadCheckoutSupportAssignment() ).resolves.toMatchObject( {
			variation: undefined,
			timedOut: false,
		} );
	} );

	it( 'returns no variation when the assignment fails', async () => {
		mockLoadExperimentAssignment.mockRejectedValue( new Error( 'Network error' ) );

		await expect( loadCheckoutSupportAssignment() ).resolves.toMatchObject( {
			variation: undefined,
			timedOut: false,
		} );
	} );

	it( 'says how long the assignment took', async () => {
		jest.useFakeTimers();
		mockLoadExperimentAssignment.mockReturnValue(
			new Promise( ( resolve ) => setTimeout( () => resolve( assignment( 'hybrid' ) ), 300 ) )
		);

		const result = loadCheckoutSupportAssignment();
		await jest.advanceTimersByTimeAsync( 300 );

		await expect( result ).resolves.toEqual( {
			variation: 'hybrid',
			timedOut: false,
			durationMs: 300,
		} );
	} );

	it( 'returns no variation when the assignment takes too long, and says it timed out', async () => {
		jest.useFakeTimers();
		mockLoadExperimentAssignment.mockReturnValue( new Promise( () => {} ) );

		const result = loadCheckoutSupportAssignment();
		await jest.advanceTimersByTimeAsync( CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS );

		await expect( result ).resolves.toEqual( {
			variation: undefined,
			timedOut: true,
			durationMs: CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS,
		} );
	} );
} );
