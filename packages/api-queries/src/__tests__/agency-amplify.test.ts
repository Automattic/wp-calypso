import { hasActiveAmplifyReports } from '../agency-amplify';
import type { AmplifyReport, AmplifyReportStatus } from '@automattic/api-core';

const reportWithStatus = ( status: AmplifyReportStatus ) => ( { status } ) as AmplifyReport;

describe( 'hasActiveAmplifyReports', () => {
	it.each( [ 'pending', 'in_progress' ] as const )( 'polls while a report is %s', ( status ) => {
		expect( hasActiveAmplifyReports( [ reportWithStatus( status ) ] ) ).toBe( true );
	} );

	it.each( [ 'completed', 'failed' ] as const )(
		'stops polling after a report is %s',
		( status ) => {
			expect( hasActiveAmplifyReports( [ reportWithStatus( status ) ] ) ).toBe( false );
		}
	);

	it( 'does not poll an empty list', () => {
		expect( hasActiveAmplifyReports( [] ) ).toBe( false );
	} );
} );
