/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import DesignPicker from '../components';
import { getAvailableDesigns } from '../utils';
import type { Design } from '../types';
import type { DesignPickerProps } from '../components';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn().mockImplementation( ( feature: string ) => {
		switch ( feature ) {
			case 'gutenboarding/landscape-preview':
				return false;
			case 'gutenboarding/mshot-preview':
				return false;
			case 'gutenboarding/alpha-templates':
				return true;
			default:
				return false;
		}
	} ),
} ) );

const MOCK_LOCALE = 'en';
const MOCK_DESIGN_TITLE = 'Cassel';

// Design picker integration tests
describe( '<DesignPicker /> integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should select a design', async () => {
		const mockedOnSelectCallback = jest.fn();

		render( <DesignPicker locale={ MOCK_LOCALE } onSelect={ mockedOnSelectCallback } /> );

		fireEvent.click( screen.getByLabelText( new RegExp( MOCK_DESIGN_TITLE, 'i' ) ) );

		expect( mockedOnSelectCallback ).toHaveBeenCalledWith(
			getAvailableDesigns().featured.find(
				( design: Design ) => design.title === MOCK_DESIGN_TITLE
			)
		);
	} );

	it( 'should show Blank Canvas designs as the first design', async () => {
		render( <DesignPicker locale={ MOCK_LOCALE } onSelect={ jest.fn() } /> );

		const firstDesignButton = screen.getAllByRole( 'button' )[ 0 ];
		expect( firstDesignButton ).toHaveTextContent( /empty\spage/i );
	} );
	( [ 'light', 'dark' ] as DesignPickerProps[ 'theme' ][] ).forEach( ( theme ) =>
		it( `Should have design-picker--theme-${ theme } class when theme prop is set to ${ theme }`, () => {
			const mockedOnSelectCallback = jest.fn();

			const renderedContainer = render(
				<DesignPicker locale={ MOCK_LOCALE } theme={ theme } onSelect={ mockedOnSelectCallback } />
			);

			expect( renderedContainer.container.firstChild ).toHaveClass(
				`design-picker design-picker--theme-${ theme }`
			);
		} )
	);
} );
