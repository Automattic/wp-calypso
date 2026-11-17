/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { setCheckpoint } from '../../utils/checkpoints';
import ColorPicker from '../color-picker';

// Mock VariationPicker
vi.mock( '../variation-picker', () => {
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
	return { default: MockVariationPicker };
} );

vi.mock( '../../utils/checkpoints', () => ( {
	checkpointKeys: { COLOR: 'color', FONT: 'font', BUTTON: 'button' },
	clearCheckpoint: vi.fn(),
	hasCheckpoint: vi.fn(),
	setCheckpoint: vi.fn(),
} ) );
vi.mock( '../../hooks/use-global-styles', () => ( {
	__esModule: true,
	default: () => ( { globalStylesId: null, globalStyles: null } ),
} ) );
vi.mock( '../../hooks/use-styles', () => ( {
	__esModule: true,
	default: () => vi.fn(),
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

	it( 'checkpoints its first pick under its surface, and disables its cards with it', () => {
		const { rerender } = render( <ColorPicker { ...defaultProps } surfaceId="colors-1" /> );
		const picker = screen.getByTestId( 'mock-variation-picker' );

		fireEvent.click( picker );
		expect( setCheckpoint ).toHaveBeenCalledWith( 'colors-1', [ 'color' ], expect.any( Object ) );

		rerender( <ColorPicker { ...defaultProps } surfaceId="colors-1" disabled /> );
		expect( picker ).toHaveAttribute( 'data-disabled', 'true' );
	} );

	it( 'renders nothing when no variations are provided', () => {
		const { container } = render( <ColorPicker { ...defaultProps } variations={ [] } /> );
		expect( container.firstChild ).toBeNull();
	} );
} );
