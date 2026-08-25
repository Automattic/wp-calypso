/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ColorPicker from '../color-picker';

// Mock VariationPicker
jest.mock( '../variation-picker', () => {
	const MockVariationPicker = ( { variations }: { variations: unknown[] } ) => (
		<div data-testid="mock-variation-picker" data-count={ variations.length } />
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
	variations: [
		{ title: 'Bold', settings: {}, styles: {} },
		{ title: 'Pastel', settings: {}, styles: {} },
	],
};

describe( 'ColorPicker', () => {
	it( 'renders VariationPicker with variations', () => {
		render( <ColorPicker { ...defaultProps } /> );
		expect( screen.getByTestId( 'mock-variation-picker' ) ).toHaveAttribute( 'data-count', '2' );
	} );

	it( 'renders nothing when no variations are provided', () => {
		const { container } = render( <ColorPicker { ...defaultProps } variations={ [] } /> );
		expect( container.firstChild ).toBeNull();
	} );
} );
