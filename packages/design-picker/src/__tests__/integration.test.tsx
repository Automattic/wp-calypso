import { render, screen, fireEvent } from '@testing-library/react';
import DesignPicker from '../components';
import type { DesignPickerProps } from '../components';
import type { Design } from '../types';

jest.mock( '@wordpress/compose', () => {
	const originalModule = jest.requireActual( '@wordpress/compose' );
	return {
		__esModule: true,
		...originalModule,
		useViewportMatch: jest.fn( () => true ),
	};
} );

const MOCK_LOCALE = 'en';
const MOCK_DESIGN_TITLE = 'Cassel';
const designs = [ { title: MOCK_DESIGN_TITLE } as Design ];

// Design picker integration tests
describe( '<DesignPicker /> integration', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should select a design', async () => {
		const mockedOnSelectCallback = jest.fn();

		render(
			<DesignPicker
				locale={ MOCK_LOCALE }
				designs={ designs }
				onSelect={ mockedOnSelectCallback }
				recommendedCategorySlug={ null }
			/>
		);

		fireEvent.click( screen.getByLabelText( new RegExp( MOCK_DESIGN_TITLE, 'i' ) ) );

		expect( mockedOnSelectCallback ).toHaveBeenCalledWith(
			designs.find( ( design: Design ) => design.title === MOCK_DESIGN_TITLE )
		);
	} );

	( [ 'light', 'dark' ] as DesignPickerProps[ 'theme' ][] ).forEach( ( theme ) =>
		it( `Should have design-picker--theme-${ theme } class when theme prop is set to ${ theme }`, () => {
			const mockedOnSelectCallback = jest.fn();

			const renderedContainer = render(
				<DesignPicker
					locale={ MOCK_LOCALE }
					designs={ designs }
					theme={ theme }
					onSelect={ mockedOnSelectCallback }
					recommendedCategorySlug={ null }
				/>
			);

			expect( renderedContainer.container.firstChild ).toHaveClass(
				`design-picker design-picker--theme-${ theme }`
			);
		} )
	);

	it( 'Should not display the header and the buttons inside the design picker', async () => {
		const renderedContainer = render(
			<DesignPicker
				locale={ MOCK_LOCALE }
				designs={ designs }
				onSelect={ jest.fn() }
				recommendedCategorySlug={ null }
				previewOnly
				hasDesignOptionHeader={ false }
				onPreview={ () => true }
			/>
		);

		expect(
			renderedContainer.container.querySelectorAll( '.design-button-cover__button' ).length
		).toBe( 0 );

		expect(
			renderedContainer.container.querySelectorAll( '.design-picker__design-option-header' ).length
		).toBe( 0 );
	} );

	it( 'Should display the header and the buttons inside the design picker', async () => {
		const renderedContainer = render(
			<DesignPicker
				locale={ MOCK_LOCALE }
				designs={ designs }
				onSelect={ jest.fn() }
				recommendedCategorySlug={ null }
				onPreview={ () => true }
			/>
		);

		expect(
			renderedContainer.container.querySelectorAll( '.design-button-cover__button' ).length
		).toBeGreaterThanOrEqual( 2 );

		expect(
			renderedContainer.container.querySelectorAll( '.design-picker__design-option-header' ).length
		).toBeGreaterThanOrEqual( 1 );
	} );
} );
