import { loadExperimentAssignment } from 'calypso/lib/explat';
import {
	CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS,
	CHECKOUT_SUPPORT_EXPERIMENT,
	loadCheckoutSupportVariation,
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

describe( 'loadCheckoutSupportVariation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the variation the user is assigned to', async () => {
		mockLoadExperimentAssignment.mockResolvedValue( assignment( 'human_only' ) );

		await expect( loadCheckoutSupportVariation() ).resolves.toBe( 'human_only' );
		expect( mockLoadExperimentAssignment ).toHaveBeenCalledWith(
			'calypso_checkout_support_routing'
		);
	} );

	it( 'returns nothing when the user is not in the experiment', async () => {
		mockLoadExperimentAssignment.mockResolvedValue( assignment( null ) );

		await expect( loadCheckoutSupportVariation() ).resolves.toBeUndefined();
	} );

	it( 'ignores variations it does not know', async () => {
		mockLoadExperimentAssignment.mockResolvedValue( assignment( 'treatment' ) );

		await expect( loadCheckoutSupportVariation() ).resolves.toBeUndefined();
	} );

	it( 'returns nothing when the assignment fails', async () => {
		mockLoadExperimentAssignment.mockRejectedValue( new Error( 'Network error' ) );

		await expect( loadCheckoutSupportVariation() ).resolves.toBeUndefined();
	} );

	it( 'returns nothing when the assignment takes too long', async () => {
		jest.useFakeTimers();
		mockLoadExperimentAssignment.mockReturnValue( new Promise( () => {} ) );

		const variation = loadCheckoutSupportVariation();
		await jest.advanceTimersByTimeAsync( CHECKOUT_SUPPORT_ASSIGNMENT_TIMEOUT_MS );

		await expect( variation ).resolves.toBeUndefined();
		jest.useRealTimers();
	} );
} );
