/**
 * @jest-environment jsdom
 */
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn(),
} ) );
jest.mock( '../bulk-actions-header', () => jest.fn() );
jest.mock( '../plugins-list', () => jest.fn() );

import { renderHook } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useEmptyMessage } from '..';

describe( 'useEmptyMessage', () => {
	beforeEach( () => {
		jest.resetAllMocks();
		useTranslate.mockReturnValue( ( s ) => s );
	} );

	it.each( [
		[ 'all', 'No plugins found.' ],
		[ 'active', 'No plugins are active.' ],
		[ 'inactive', 'No plugins are inactive.' ],
		[ 'updates', 'All plugins are up to date.' ],
	] )( 'returns the correct message when given the "%s" filter', ( filter, expectedMessage ) => {
		const {
			result: { current: actualMessage },
		} = renderHook( () => useEmptyMessage( null, filter ) );
		expect( actualMessage ).toBe( expectedMessage );
	} );

	it.each( [ [ '' ], [ 'whatever' ], [ null ] ] )(
		'returns undefined when a non-existent filter is passed in',
		( filter ) => {
			const {
				result: { current: message },
			} = renderHook( () => useEmptyMessage( null, filter ) );
			expect( message ).toBeUndefined();
		}
	);
} );
