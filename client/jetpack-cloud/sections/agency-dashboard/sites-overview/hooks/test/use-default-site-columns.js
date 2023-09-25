/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { renderHook } from '@testing-library/react';
import useDefaultSiteColumns from '../use-default-site-columns';

jest.mock( '@automattic/calypso-config' );

describe( 'useSiteColumns', () => {
	it.each( [ [ 'Site' ], [ 'Stats' ], [ 'Backup' ], [ 'Scan' ], [ 'Monitor' ], [ 'Plugins' ] ] )(
		'includes a column for %s',
		( expectedColumnTitle ) => {
			const {
				result: { current: columns },
			} = renderHook( () => useDefaultSiteColumns() );

			const columnTitles = columns.map( ( { title } ) => title );
			expect( columnTitles ).toContain( expectedColumnTitle );
		}
	);

	it( 'includes a column for Boost if Boost is enabled on the dashboard', () => {
		isEnabled.mockReturnValue( true );

		const {
			result: { current: columns },
		} = renderHook( () => useDefaultSiteColumns() );

		const columnTitles = columns.map( ( { title } ) => title );
		expect( columnTitles ).toContain( 'Boost score' );
	} );

	it( 'does not include the Boost column if Boost is not enabled on the dashboard', () => {
		isEnabled.mockReturnValue( false );

		const {
			result: { current: columns },
		} = renderHook( () => useDefaultSiteColumns() );

		const columnTitles = columns.map( ( { title } ) => title );
		expect( columnTitles ).not.toContain( 'Boost score' );
	} );
} );
