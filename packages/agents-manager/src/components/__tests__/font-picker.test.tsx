/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { setCheckpoint } from '../../utils/checkpoints';
import { injectFontFamiliesIntoEditorIframe } from '../../utils/font-families-to-css';
import FontPicker from '../font-picker';

// Mock VariationPicker to avoid deep `@wordpress/components` import chain.
jest.mock( '../variation-picker', () => {
	const MockVariationPicker = ( {
		variations,
		disabled,
		onSelect,
	}: {
		variations: unknown[];
		disabled?: boolean;
		onSelect?: ( variation: unknown ) => void;
	} ) => (
		<button
			data-testid="mock-variation-picker"
			data-count={ variations.length }
			data-disabled={ disabled }
			onClick={ () => onSelect?.( variations[ 0 ] ) }
		/>
	);
	MockVariationPicker.displayName = 'MockVariationPicker';
	return MockVariationPicker;
} );

jest.mock( '../../utils/checkpoints', () => ( {
	checkpointKeys: { COLOR: 'color', FONT: 'font', BUTTON: 'button' },
	clearCheckpoint: jest.fn(),
	hasCheckpoint: jest.fn(),
	setCheckpoint: jest.fn(),
} ) );
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
	beforeEach( () => jest.clearAllMocks() );

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

	it( 'checkpoints its first pick under its surface, and disables its cards with it', () => {
		const { rerender } = render( <FontPicker { ...defaultProps } surfaceId="fonts-1" /> );
		const picker = screen.getByTestId( 'mock-variation-picker' );

		fireEvent.click( picker );
		expect( setCheckpoint ).toHaveBeenCalledWith( 'fonts-1', [ 'font' ], expect.any( Object ) );

		rerender( <FontPicker { ...defaultProps } surfaceId="fonts-1" disabled /> );
		expect( picker ).toHaveAttribute( 'data-disabled', 'true' );
	} );

	it( 'loads the picked variation fonts into the editor canvas', () => {
		const families = [ { name: 'Inter', fontFamily: 'Inter' } ];
		const variation = {
			title: 'Modern Sans',
			settings: { typography: { fontFamilies: { theme: families } } },
			styles: {},
		};
		const { getByTestId } = render( <FontPicker variations={ [ variation ] } /> );

		// The mount preload also injects — only the pick-path call counts here.
		( injectFontFamiliesIntoEditorIframe as jest.Mock ).mockClear();
		fireEvent.click( getByTestId( 'mock-variation-picker' ) );

		expect( injectFontFamiliesIntoEditorIframe ).toHaveBeenCalledTimes( 1 );
		expect( injectFontFamiliesIntoEditorIframe ).toHaveBeenCalledWith( families );
	} );

	it( 'leaves the editor canvas alone when its message is stale', () => {
		const variation = {
			title: 'Modern Sans',
			settings: {
				typography: { fontFamilies: { theme: [ { name: 'Inter', fontFamily: 'Inter' } ] } },
			},
			styles: {},
		};
		render( <FontPicker variations={ [ variation ] } isMessageStale /> );

		expect( injectFontFamiliesIntoEditorIframe ).not.toHaveBeenCalled();
	} );
} );
