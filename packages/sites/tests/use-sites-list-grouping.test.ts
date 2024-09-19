/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSitesListGrouping } from '../src';
import { createMockSite } from './create-mock-site';

const status = 'all';

describe( 'useSitesListGrouping', () => {
	test( 'filter by "private"', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );

		const { result } = renderHook( () =>
			useSitesListGrouping( [ public1, public2, private1, private2, comingSoon ], {
				status: 'private',
			} )
		);

		expect( result.current.currentStatusGroup ).toEqual( [ private1, private2 ] );
	} );

	test( 'does not return hidden sites by default', () => {
		const visible = createMockSite( { visible: true } );
		const hidden = createMockSite( { visible: false } );

		const { result } = renderHook( () => useSitesListGrouping( [ visible, hidden ], { status } ) );

		expect( result.current.currentStatusGroup ).toEqual( [ visible ] );
	} );

	test( 'returns hidden sites when asked', () => {
		const visible = createMockSite( { visible: true } );
		const hidden = createMockSite( { visible: false } );

		const { result } = renderHook( () =>
			useSitesListGrouping( [ visible, hidden ], { status, showHidden: true } )
		);

		expect( result.current.currentStatusGroup ).toEqual( [ visible, hidden ] );
	} );

	test( 'returns counts for each status type', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true, visible: false } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );
		const redirect1 = createMockSite( {
			options: { is_redirect: true, unmapped_url: 'http://redirect1.com' },
		} );
		const redirect2 = createMockSite( {
			options: { is_redirect: true, unmapped_url: 'http://redirect2.com' },
		} );
		const deleted1 = createMockSite( { is_deleted: true } );

		const { result } = renderHook( () =>
			useSitesListGrouping(
				[ public1, public2, private1, private2, comingSoon, redirect1, redirect2, deleted1 ],
				{
					status,
				}
			)
		);

		expect( result.current.statuses ).toEqual( [
			{
				name: 'all',
				count: 7, // hidden site not included in count
				title: expect.any( String ),
				hiddenCount: 1,
			},
			{
				name: 'public',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'private',
				count: 1, // hidden site not included in count
				title: expect.any( String ),
				hiddenCount: 1,
			},
			{
				name: 'coming-soon',
				count: 1,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'redirect',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'deleted',
				count: 1,
				title: expect.any( String ),
				hiddenCount: 0,
			},
		] );
	} );

	test( 'showHidden option includes hidden sites in `count`, but not `hiddenCount`', () => {
		const public1 = createMockSite( { is_private: false } );
		const public2 = createMockSite( { is_private: false, visible: false } );
		const private1 = createMockSite( { is_private: true } );
		const private2 = createMockSite( { is_private: true, visible: false } );
		const comingSoon = createMockSite( { is_private: true, is_coming_soon: true } );
		const deleted1 = createMockSite( { is_deleted: true } );

		const { result } = renderHook( () =>
			useSitesListGrouping( [ public1, public2, private1, private2, comingSoon, deleted1 ], {
				showHidden: true,
				status,
			} )
		);

		expect( result.current.statuses ).toEqual( [
			{
				name: 'all',
				count: 6,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'public',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'private',
				count: 2,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'coming-soon',
				count: 1,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'redirect',
				count: 0,
				title: expect.any( String ),
				hiddenCount: 0,
			},
			{
				name: 'deleted',
				count: 1,
				title: expect.any( String ),
				hiddenCount: 0,
			},
		] );
	} );
} );
