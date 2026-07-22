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

	it( 'fits two rows per page with pagination at larger widths', () => {
		// 460px → 3 columns → 6 options per page.
		mockWidth = 460;
		const { container } = render(
			<VariationPicker
				{ ...defaultProps }
				variations={ manyVariations }
				maxToShow={ 4 }
				type="color"
			/>
		);

		expect( screen.getAllByTestId( 'variation' ) ).toHaveLength( 6 );
		expect(
			container.querySelector( '.agents-manager-variation-picker__arrows' )
		).toBeInTheDocument();
	} );

	it( 'shows every option without pagination at full width', () => {
		// 640px → 4 columns — the full-width tier.
		mockWidth = 640;
		const { container } = render(
			<VariationPicker
				{ ...defaultProps }
				variations={ manyVariations }
				maxToShow={ 4 }
				type="color"
			/>
		);

		expect( screen.getAllByTestId( 'variation' ) ).toHaveLength( 8 );
		expect(
			container.querySelector( '.agents-manager-variation-picker__arrows' )
		).not.toBeInTheDocument();
	} );
	it( 'shows navigation buttons when variations exceed `maxToShow`', () => {
		const { container } = render(
			<VariationPicker
				{ ...defaultProps }
				variations={ mockVariations }
				maxToShow={ 1 }
				type="color"
			/>
		);

		const arrows = container.querySelector( '.agents-manager-variation-picker__arrows' );
		expect( arrows ).toBeInTheDocument();

		const buttons = container.querySelectorAll( 'button' );
		expect( buttons ).toHaveLength( 2 );
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
				variations={ mockVariations }
				maxToShow={ value }
				type="color"
			/>
		);

		// 3 variations fit inside the default page of 4 — all render, no arrows.
		expect( screen.getAllByTestId( 'variation' ) ).toHaveLength( 3 );
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
