/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import Variation from '../variation-picker/variation';

// Mock StylesPreview
jest.mock( '../styles-preview', () => {
	const MockStylesPreview = () => <div data-testid="mock-styles-preview" />;
	MockStylesPreview.displayName = 'MockStylesPreview';
	return MockStylesPreview;
} );

const defaultProps = {
	onSelect: jest.fn(),
	globalStyles: {},
	paletteColors: [],
	themeColors: [],
};

const mockVariation = {
	title: 'Test Variation',
	settings: {},
	styles: {},
};

describe( 'Variation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the variation with aria-label', () => {
		render( <Variation { ...defaultProps } variation={ mockVariation } type="color" /> );
		expect( screen.getByLabelText( 'Test Variation' ) ).toBeInTheDocument();
	} );

	it( 'calls onSelect when clicked', () => {
		const onSelect = jest.fn();
		render(
			<Variation
				{ ...defaultProps }
				variation={ mockVariation }
				type="color"
				onSelect={ onSelect }
			/>
		);
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( onSelect ).toHaveBeenCalledWith( mockVariation );
	} );

	it( 'handles ENTER key press', () => {
		const onSelect = jest.fn();
		render(
			<Variation
				{ ...defaultProps }
				variation={ mockVariation }
				type="font"
				onSelect={ onSelect }
			/>
		);
		fireEvent.keyDown( screen.getByRole( 'button' ), { key: 'Enter' } );
		expect( onSelect ).toHaveBeenCalledWith( mockVariation );
	} );

	it( 'applies active class when isActive is true', () => {
		render( <Variation { ...defaultProps } variation={ mockVariation } type="color" isActive /> );
		expect( screen.getByRole( 'button' ) ).toHaveClass( 'is-active' );
	} );

	it( 'does not apply active class when isActive is false', () => {
		render(
			<Variation { ...defaultProps } variation={ mockVariation } type="color" isActive={ false } />
		);
		expect( screen.getByRole( 'button' ) ).not.toHaveClass( 'is-active' );
	} );

	it( 'renders description when provided', () => {
		const variationWithDescription = {
			...mockVariation,
			description: 'Test Description',
		};
		render( <Variation { ...defaultProps } variation={ variationWithDescription } type="color" /> );
		expect( screen.getByLabelText( 'Test Variation (Test Description)' ) ).toBeInTheDocument();
	} );
} );
