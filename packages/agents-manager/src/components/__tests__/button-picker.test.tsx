/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import ButtonPicker from '../button-picker';

// Mock VariationPicker to capture props without deep `@wordpress/components` chain.
jest.mock( '../variation-picker', () => {
	const MockVariationPicker = ( props: Record< string, unknown > ) => (
		<div
			data-testid="mock-variation-picker"
			data-count={ ( props.variations as unknown[] ).length }
			data-type={ props.type }
			data-max={ props.maxToShow }
		/>
	);
	MockVariationPicker.displayName = 'MockVariationPicker';
	return MockVariationPicker;
} );

jest.mock( '../../hooks/use-global-styles', () => ( {
	__esModule: true,
	default: () => ( { globalStylesId: null, globalStyles: null } ),
} ) );
jest.mock( '../../hooks/use-styles', () => ( {
	__esModule: true,
	default: () => jest.fn(),
} ) );

const defaultProps = {
	buttonVariations: [
		{ title: 'Rounded', settings: {}, styles: {} },
		{ title: 'Square', settings: {}, styles: {} },
	],
};

describe( 'ButtonPicker', () => {
	it( 'renders VariationPicker with variations', () => {
		const { getByTestId } = render( <ButtonPicker { ...defaultProps } /> );
		expect( getByTestId( 'mock-variation-picker' ) ).toHaveAttribute( 'data-count', '2' );
	} );

	it( 'passes type="button" to VariationPicker', () => {
		const { getByTestId } = render( <ButtonPicker { ...defaultProps } /> );
		expect( getByTestId( 'mock-variation-picker' ) ).toHaveAttribute( 'data-type', 'button' );
	} );

	it( 'uses default maxToShow of 12', () => {
		const { getByTestId } = render( <ButtonPicker { ...defaultProps } /> );
		expect( getByTestId( 'mock-variation-picker' ) ).toHaveAttribute( 'data-max', '12' );
	} );

	it( 'renders null when no variations', () => {
		const { container } = render( <ButtonPicker { ...defaultProps } buttonVariations={ [] } /> );
		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'handles non-array variations gracefully', () => {
		const { container } = render(
			<ButtonPicker { ...defaultProps } buttonVariations={ 'not-an-array' as unknown as [] } />
		);
		expect( container.innerHTML ).toBe( '' );
	} );
} );
