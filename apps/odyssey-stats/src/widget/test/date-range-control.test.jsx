/**
 * @jest-environment jsdom
 */
import { DropdownMenu } from '@wordpress/components';
import { render } from '@testing-library/react';
import DateRangeControl from '../date-range-control';

jest.mock( '@wordpress/components', () => ( {
	DropdownMenu: jest.fn( () => null ),
	MenuGroup: ( { children } ) => children,
	MenuItem: ( { children } ) => children,
} ) );

describe( 'DateRangeControl', () => {
	beforeEach( () => {
		DropdownMenu.mockClear();
	} );

	it( 'shows the selected range on the button', () => {
		render( <DateRangeControl value="last_30_days" onChange={ jest.fn() } /> );
		expect( DropdownMenu.mock.calls[ 0 ][ 0 ].text ).toBe( 'Last 30 days' );
	} );

	it( 'names the button with the range it shows, for speech control', () => {
		render( <DateRangeControl value="last_30_days" onChange={ jest.fn() } /> );
		expect( DropdownMenu.mock.calls[ 0 ][ 0 ].label ).toBe( 'Date range: Last 30 days' );
	} );
} );
