/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import ButtonPicker from '../button-picker';

// Mock VariationPicker to capture props without deep `@wordpress/components` chain.
let mockLastPickerProps: Record< string, unknown > | null = null;
jest.mock( '../variation-picker', () => {
	const MockVariationPicker = ( props: Record< string, unknown > ) => {
		mockLastPickerProps = props;
		return (
			<div
				data-testid="mock-variation-picker"
				data-count={ ( props.variations as unknown[] ).length }
				data-type={ props.type }
				data-max={ props.maxToShow }
			/>
		);
	};
	MockVariationPicker.displayName = 'MockVariationPicker';
	return MockVariationPicker;
} );

let mockGlobalStyles: Record< string, unknown > | null = null;
jest.mock( '../../hooks/use-global-styles', () => ( {
	__esModule: true,
	default: () => ( { globalStylesId: null, globalStyles: mockGlobalStyles } ),
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
	beforeEach( () => {
		mockLastPickerProps = null;
		mockGlobalStyles = null;
	} );

	it( 'snapshots only the button treatment for the synthetic "Current"', () => {
		mockGlobalStyles = {
			styles: {
				color: { text: '#111' },
				elements: {
					button: {
						border: { radius: '4px' },
						spacing: { padding: '8px' },
						color: { background: '#fff', text: '#000' },
						buttonColor: { background: '#eee', text: '#222' },
					},
					h1: { typography: { fontWeight: '700' } },
				},
			},
		};
		render( <ButtonPicker { ...defaultProps } /> );

		const variations = mockLastPickerProps?.variations as Array< {
			title?: string;
			styles?: unknown;
		} >;
		const current = variations.find( ( v ) => v.title === 'Current' );
		expect( current?.styles ).toEqual( {
			elements: {
				button: {
					border: { radius: '4px' },
					spacing: { padding: '8px' },
					color: { background: '#fff', text: '#000' },
				},
			},
		} );
	} );
	it( 'renders VariationPicker with the variations, button type, and default page size', () => {
		const { getByTestId } = render( <ButtonPicker { ...defaultProps } /> );
		const picker = getByTestId( 'mock-variation-picker' );

		expect( picker ).toHaveAttribute( 'data-count', '2' );
		expect( picker ).toHaveAttribute( 'data-type', 'button' );
		expect( picker ).toHaveAttribute( 'data-max', '12' );
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
