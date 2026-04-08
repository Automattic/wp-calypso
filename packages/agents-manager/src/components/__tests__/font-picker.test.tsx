/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import FontPicker from '../font-picker';

// Mock VariationPicker to avoid deep `@wordpress/components` import chain.
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
jest.mock( '../../utils/font-families-to-css', () => ( {
	fontFamiliesToCSS: jest.fn( () => '' ),
	injectFontFamiliesIntoEditorIframe: jest.fn(),
} ) );

const defaultProps = {
	variations: [
		{ title: 'Modern Sans', settings: {}, styles: {} },
		{ title: 'Classic Serif', settings: {}, styles: {} },
	],
};

describe( 'FontPicker', () => {
	it( 'renders VariationPicker with variations', () => {
		const { getByTestId } = render( <FontPicker { ...defaultProps } /> );
		expect( getByTestId( 'mock-variation-picker' ) ).toHaveAttribute( 'data-count', '2' );
	} );

	it( 'renders null when no variations', () => {
		const { container } = render( <FontPicker { ...defaultProps } variations={ [] } /> );
		expect( container.innerHTML ).toBe( '' );
	} );

	it( 'deduplicates variations by title', () => {
		const duped = [
			{ title: 'Modern Sans', settings: {}, styles: {} },
			{ title: 'Modern Sans', settings: {}, styles: {} },
			{ title: 'Classic Serif', settings: {}, styles: {} },
		];
		const { getByTestId } = render( <FontPicker { ...defaultProps } variations={ duped } /> );
		expect( getByTestId( 'mock-variation-picker' ) ).toHaveAttribute( 'data-count', '2' );
	} );
} );
