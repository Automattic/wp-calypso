/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import {
	useMultisiteUpdateScheduleQuery,
	type MultisiteSchedulesUpdatesResponse,
	type ScheduleUpdates,
} from '../use-update-schedules-query';

jest.mock( 'calypso/components/localized-moment', () => ( {
	useLocalizedMoment: () => jest.requireActual( 'moment' ),
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: () => [
		{ ID: 1, slug: 'first-site' },
		{ ID: 2, slug: 'second-site' },
	],
} ) );
jest.mock( 'calypso/state/selectors/get-sites', () => jest.fn() );
jest.mock( 'wpcom-proxy-request', () => jest.fn() );

const timestamp = 1700000000;
const schedule = ( overrides: Partial< ScheduleUpdates > = {} ): ScheduleUpdates => ( {
	id: 'daily',
	schedule: 'daily',
	interval: 86400,
	timestamp,
	args: [ 'first-plugin' ],
	active: true,
	last_run_timestamp: null,
	last_run_status: null,
	...overrides,
} );

function renderSchedules( data: MultisiteSchedulesUpdatesResponse ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( [ 'multisite-schedules-update' ], data );
	const wrapper = ( { children }: { children: ReactNode } ) =>
		createElement( QueryClientProvider, { client: queryClient }, children );
	return renderHook( () => useMultisiteUpdateScheduleQuery( false ), { wrapper } );
}

describe( 'useMultisiteUpdateScheduleQuery', () => {
	it( 'groups matching local times across dates while preserving first schedule metadata and site status', () => {
		const data: MultisiteSchedulesUpdatesResponse = {
			sites: {
				1: { daily: schedule() },
				2: {
					daily: schedule( {
						timestamp: timestamp + 86400,
						args: [ 'second-plugin' ],
						active: false,
						last_run_status: 'failure',
					} ),
				},
			},
		};
		const original = structuredClone( data );
		const { result } = renderSchedules( data );

		expect( result.current.data ).toHaveLength( 1 );
		expect( result.current.data?.[ 0 ] ).toMatchObject( {
			schedule_id: 'daily',
			timestamp,
			args: [ 'first-plugin' ],
			sites: [
				{ ID: 1, slug: 'first-site', active: true, last_run_status: null },
				{ ID: 2, slug: 'second-site', active: false, last_run_status: 'failure' },
			],
		} );
		expect( data ).toEqual( original );
	} );

	it( 'keeps different IDs and intervals separate and sorts daily before weekly with stable timestamp ties', () => {
		const { result } = renderSchedules( {
			sites: {
				1: {
					weekly: schedule( { schedule: 'weekly', interval: 604800 } ),
					later: schedule( { timestamp: timestamp + 3600 } ),
					first: schedule(),
					second: schedule(),
				},
				2: { first: schedule( { interval: 172800 } ) },
			},
		} );

		expect( result.current.data?.map( ( item ) => [ item.schedule_id, item.interval ] ) ).toEqual( [
			[ 'first', 86400 ],
			[ 'second', 86400 ],
			[ 'first', 172800 ],
			[ 'later', 86400 ],
			[ 'weekly', 604800 ],
		] );
	} );

	it( 'returns no groups for an empty response', () => {
		const { result } = renderSchedules( { sites: {} } );
		expect( result.current.data ).toEqual( [] );
	} );
} );
