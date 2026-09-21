/**
 * @jest-environment jsdom
 */
import { namePulseTldsQuery } from '@automattic/api-queries';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { NAME_PULSE_TLDS_FIXTURE } from '../../../test-helpers/factories/name-pulse';
import { queryClient, TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseDomainStatus } from '../../helpers';
import { useNamePulseSearch } from '../use-name-pulse-search';

const API = 'https://public-api.wordpress.com';
const AVAILABILITY_PATH = '/wpcom/v2/domains/name-pulse/availability-check';

const renderSearch = ( query: string ) =>
	renderHook( ( { q }: { q: string } ) => useNamePulseSearch( q ), {
		initialProps: { q: query },
		wrapper: ( { children } ) => <TestDomainSearch>{ children }</TestDomainSearch>,
	} );

describe( 'useNamePulseSearch', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		queryClient.clear();
		queryClient.setQueryData( namePulseTldsQuery().queryKey, NAME_PULSE_TLDS_FIXTURE );
	} );

	afterEach( () => nock.cleanAll() );

	it( 'keeps the status of a row a refined query still lists and only requests the new rows', async () => {
		const requests: string[][] = [];
		nock( API )
			.persist()
			.post( AVAILABILITY_PATH )
			.reply( 200, ( _uri, body: { domain_names: string[] } ) => {
				requests.push( body.domain_names );

				return Object.fromEntries(
					body.domain_names.map( ( name ) => [
						name,
						{ is_available: true, cost: '$12.00', raw_price: 12 },
					] )
				);
			} );

		const { result, rerender } = renderSearch( 'test' );
		const statusOf = ( name: string ) =>
			[ ...result.current.topResults, ...result.current.exactList ].find(
				( row ) => row.domain_name === name
			)?.status;

		await waitFor( () => expect( statusOf( 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE ) );
		expect( requests ).toHaveLength( 1 );

		rerender( { q: 'testcom' } );

		expect( statusOf( 'test.com' ) ).toBe( NamePulseDomainStatus.AVAILABLE );
		expect( statusOf( 'testcom.blog' ) ).toBe( NamePulseDomainStatus.WAITING );

		await waitFor( () => expect( requests ).toHaveLength( 2 ) );
		expect( requests[ 1 ] ).toContain( 'testcom.blog' );
		expect( requests[ 1 ] ).not.toContain( 'test.com' );

		await waitFor( () =>
			expect( statusOf( 'testcom.blog' ) ).toBe( NamePulseDomainStatus.AVAILABLE )
		);
	} );
} );
