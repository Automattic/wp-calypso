import { amplifyJobsQuery } from '../agency';
import type { Query } from '@tanstack/react-query';

// The refetchInterval is a function of the current query state: poll while any
// job is still pending, otherwise stop.
function refetchIntervalFor( data: Array< { status: string } > | undefined ) {
	const { refetchInterval } = amplifyJobsQuery( 1 );
	const query = { state: { data } } as unknown as Query;
	return ( refetchInterval as ( q: Query ) => number | false )( query );
}

describe( 'amplifyJobsQuery polling', () => {
	it( 'polls every 15s while a job is pending', () => {
		expect( refetchIntervalFor( [ { status: 'pending' } ] ) ).toBe( 15_000 );
	} );

	it( 'stops polling when no job is pending', () => {
		expect( refetchIntervalFor( [ { status: 'failed' } ] ) ).toBe( false );
	} );

	it( 'stops polling when data is not yet loaded', () => {
		expect( refetchIntervalFor( undefined ) ).toBe( false );
	} );
} );
