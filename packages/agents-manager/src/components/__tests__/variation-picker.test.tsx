/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import VariationPicker from '../variation-picker';

// Mock the `Variation` component
jest.mock( '../variation-picker/variation', () => {
	const MockVariation = ( { variation }: { variation: { title: string } } ) => (
		<div data-testid="variation">{ variation?.title }</div>
	);
	MockVariation.displayName = 'MockVariation';
	return MockVariation;
} );

jest.mock( '@wordpress/components', () => ( {
	__experimentalGrid: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	__experimentalVStack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	Button: ( { children, ...props }: { children: React.ReactNode } ) => (
		<button { ...props }>{ children }</button>
	),
	Tooltip: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( '@wordpress/icons', () => ( {
	chevronLeft: 'chevron-left',
	chevronRight: 'chevron-right',
} ) );

let mockWidth: number | null = null;
jest.mock( '@wordpress/compose', () => ( {
	useResizeObserver: () => [ null, { width: mockWidth } ],
} ) );

const defaultProps = {
	onSelect: jest.fn(),
};

const mockVariations = [
	{ title: 'Variation 1', settings: {}, styles: {} },
	{ title: 'Variation 2', settings: {}, styles: {} },
	{ title: 'Variation 3', settings: {}, styles: {} },
];

const manyVariations = Array.from( { length: 8 }, ( _, index ) => ( {
	title: `Variation ${ index + 1 }`,
	settings: {},
	styles: {},
} ) );

describe( 'VariationPicker', () => {
	beforeEach( () => {
		mockWidth = null;
	} );

	it( 'shows navigation buttons when variations exceed the page', () => {
		const { container } = render(
			<VariationPicker
				{ ...defaultProps }
				variations={ manyVariations }
				maxToShow={ 2 }
				type="color"
			/>
		);

		const arrows = container.querySelector( '.agents-manager-variation-picker__arrows' );
		expect( arrows ).toBeInTheDocument();

		const buttons = container.querySelectorAll( 'button' );
		expect( buttons ).toHaveLength( 2 );
	} );

	it( 'shows every option without pagination when the width fits them', () => {
		mockWidth = 640;
		render(
			<VariationPicker
				{ ...defaultProps }
				variations={ manyVariations }
				maxToShow={ 2 }
				type="color"
			/>
		);

		// 4 columns at 640px → 8 options fill 2 rows, so no paging.
		expect( screen.getAllByTestId( 'variation' ) ).toHaveLength( 8 );
		expect( screen.queryByText( '1/4' ) ).not.toBeInTheDocument();
	} );

	it( 'hides navigation buttons when variations fit within `maxToShow`', () => {
		const { container } = render(
			<VariationPicker
				{ ...defaultProps }
				variations={ mockVariations }
				maxToShow={ 6 }
				type="color"
			/>
		);

		const arrows = container.querySelector( '.agents-manager-variation-picker__arrows' );
		expect( arrows ).not.toBeInTheDocument();
	} );

	it.each( [ 0, -1, NaN ] )( 'falls back to the default page size for maxToShow=%p', ( value ) => {
		render(
			<VariationPicker
				{ ...defaultProps }
				variations={ manyVariations }
				maxToShow={ value }
				type="color"
			/>
		);

		// 8 options at the narrow 2-column width paginate at the default page of 4.
		expect( screen.getAllByTestId( 'variation' ) ).toHaveLength( 4 );
	} );

	it( 'displays the correct number of variations', () => {
		render(
			<VariationPicker
				{ ...defaultProps }
				variations={ mockVariations }
				maxToShow={ 3 }
				type="color"
			/>
		);

		const displayedVariations = screen.getAllByTestId( 'variation' );
		expect( displayedVariations ).toHaveLength( 3 );
	} );

	it( 'renders no variations or arrows when the list is empty', () => {
		const { container } = render(
			<VariationPicker { ...defaultProps } variations={ [] } type="color" />
		);

		expect( screen.queryByTestId( 'variation' ) ).not.toBeInTheDocument();
		expect(
			container.querySelector( '.agents-manager-variation-picker__arrows' )
		).not.toBeInTheDocument();
	} );
} );
