import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getHonestStage } from '../get-honest-stage';

describe( 'getHonestStage', () => {
	it.each( [
		[ transferStates.PENDING ],
		[ transferStates.START ],
		[ transferStates.SETUP ],
		[ transferStates.ACTIVE ],
		[ transferStates.UPLOADING ],
	] )( 'maps %s to the preparing stage', ( transferStatus ) => {
		expect( getHonestStage( { transferStatus, currentStep: 1 } ) ).toBe( 0 );
	} );

	it.each( [
		[ transferStates.PROVISIONED ],
		[ transferStates.RELOCATING ],
		[ transferStates.BACKFILLING ],
	] )( 'maps %s to the moving stage', ( transferStatus ) => {
		expect( getHonestStage( { transferStatus, currentStep: 1 } ) ).toBe( 1 );
	} );

	it.each( [ [ transferStates.COMPLETE ], [ transferStates.COMPLETED ] ] )(
		'maps %s to the finishing stage',
		( transferStatus ) => {
			expect( getHonestStage( { transferStatus, currentStep: 1 } ) ).toBe( 2 );
		}
	);

	it( 'a transfer known to be in flight outranks the page reaching the activation step', () => {
		expect( getHonestStage( { transferStatus: transferStates.ACTIVE, currentStep: 2 } ) ).toBe( 0 );
		expect( getHonestStage( { transferStatus: transferStates.PROVISIONED, currentStep: 2 } ) ).toBe(
			1
		);
	} );

	it( 'without a known transfer status, the activation step means finishing', () => {
		expect( getHonestStage( { transferStatus: null, currentStep: 2 } ) ).toBe( 2 );
		expect( getHonestStage( { transferStatus: transferStates.NONE, currentStep: 2 } ) ).toBe( 2 );
	} );

	it( 'without a known transfer status and before activation, it is preparing', () => {
		expect( getHonestStage( { transferStatus: null, currentStep: 1 } ) ).toBe( 0 );
	} );
} );
