import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getHonestStage } from '../get-honest-stage';

describe( 'getHonestStage', () => {
	it.each( [
		[ transferStates.NULL ],
		[ transferStates.NONE ],
		[ transferStates.PENDING ],
		[ transferStates.INQUIRING ],
		[ transferStates.START ],
		[ transferStates.SETUP ],
		[ transferStates.ACTIVE ],
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

	it( 'reaching the activation step means finishing, whatever the last polled status was', () => {
		expect( getHonestStage( { transferStatus: transferStates.ACTIVE, currentStep: 2 } ) ).toBe( 2 );
	} );
} );
