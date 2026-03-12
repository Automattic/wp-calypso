/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Mock dependencies - MUST be before imports that use them
jest.mock( '@automattic/agenttic-ui', () => {
	const React = require( 'react' );
	const { useState } = React;

	return {
		AgentUI: {
			InputToolbar: ( { label, icon, className, disabled, children }: any ) => {
				const [ isOpen, setIsOpen ] = useState( false );

				return (
					<div className={ className }>
						<button
							type="button"
							disabled={ disabled }
							data-testid="toolbar-button"
							onClick={ () => setIsOpen( ! isOpen ) }
						>
							{ icon }
							{ label }
						</button>
						{ isOpen && <div data-testid="dropdown-content">{ children }</div> }
					</div>
				);
			},
		},
		cn: ( ...args: any[] ) => {
			return args
				.map( ( arg ) => {
					if ( typeof arg === 'string' ) {
						return arg;
					}
					if ( typeof arg === 'object' && arg !== null ) {
						return Object.keys( arg )
							.filter( ( key ) => arg[ key ] )
							.join( ' ' );
					}
					return '';
				} )
				.filter( Boolean )
				.join( ' ' );
		},
	};
} );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../../utils/tracking', () => ( {
	trackImageStudioStyleSelected: jest.fn(),
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

jest.mock( '../icons/BrushIcon', () => ( {
	BrushIcon: ( { size }: { size: number } ) => <div data-testid="brush-icon">Brush { size }</div>,
} ) );

// Import after mocks
import { useDispatch, useSelect } from '@wordpress/data';
import { ImageStudioMode } from '../../types';
import { trackImageStudioStyleSelected } from '../../utils/tracking';
import { STYLE_OPTIONS, StylePicker } from './index';

const mockUseDispatch = useDispatch as jest.MockedFunction< typeof useDispatch >;
const mockUseSelect = useSelect as jest.MockedFunction< typeof useSelect >;
const mockTrackStyleSelected = trackImageStudioStyleSelected as jest.MockedFunction<
	typeof trackImageStudioStyleSelected
>;

describe( 'StylePicker', () => {
	const mockSetSelectedStyle = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		mockUseDispatch.mockReturnValue( {
			setSelectedStyle: mockSetSelectedStyle,
		} as any );

		mockUseSelect.mockImplementation( ( selector: any ) => {
			const result = selector( () => ( {
				getSelectedStyle: () => '',
			} ) );
			return result;
		} );

		// Mock requestAnimationFrame
		global.requestAnimationFrame = jest.fn( ( cb ) => {
			cb( 0 );
			return 0;
		} );

		// Mock document.body.dispatchEvent
		document.body.dispatchEvent = jest.fn();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'renders style picker with default label', () => {
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// When selectedStyle is '', it shows 'None' (the label for value: '')
			expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'None' );
		} );

		it( 'renders style picker with selected style label', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getSelectedStyle: () => 'vivid',
				} ) );
				return result;
			} );

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'Vivid' );
		} );

		it( 'renders brush icon', () => {
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			expect( screen.getByTestId( 'brush-icon' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Brush 16' ) ).toBeInTheDocument();
		} );

		it( 'renders all style options with previews', async () => {
			const user = userEvent.setup();
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			// Filter out the first option which has no preview
			const optionsWithPreviews = STYLE_OPTIONS.filter( ( opt ) => opt.preview );

			const styleButtons = screen.getAllByRole( 'button' ).filter( ( button ) => {
				return button.querySelector( 'img' ) !== null;
			} );

			expect( styleButtons ).toHaveLength( optionsWithPreviews.length );
		} );

		it( 'renders style option labels', async () => {
			const user = userEvent.setup();
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			// Now check for labels within the dropdown
			const dropdown = screen.getByTestId( 'dropdown-content' );
			expect( dropdown ).toHaveTextContent( 'None' );
			expect( dropdown ).toHaveTextContent( 'Vivid' );
			expect( dropdown ).toHaveTextContent( 'Anime' );
			expect( dropdown ).toHaveTextContent( 'Photographic' );
		} );

		it( 'renders style option images with empty alt text', async () => {
			const user = userEvent.setup();
			const { container } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			// Images with alt="" are presentational, so use DOM query instead of getByRole('img')
			const images = container.querySelectorAll( 'img' );
			expect( images.length ).toBeGreaterThan( 0 );

			images.forEach( ( img ) => {
				expect( img ).toHaveAttribute( 'alt', '' );
			} );
		} );

		it( 'applies is-selected class to selected style', async () => {
			const user = userEvent.setup();
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getSelectedStyle: () => 'vivid',
				} ) );
				return result;
			} );

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			// Find the vivid button in the dropdown
			const vividButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Vivid' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			expect( vividButton ).toHaveClass( 'is-selected' );
		} );

		it( 'disables style picker when disabled prop is true', () => {
			render( <StylePicker mode={ ImageStudioMode.Generate } disabled /> );

			const toolbarButton = screen.getByTestId( 'toolbar-button' );
			expect( toolbarButton ).toBeDisabled();
		} );

		it( 'enables style picker by default', () => {
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			const toolbarButton = screen.getByTestId( 'toolbar-button' );
			expect( toolbarButton ).not.toBeDisabled();
		} );
	} );

	describe( 'Style Selection', () => {
		it( 'calls setSelectedStyle when a style is clicked', async () => {
			const user = userEvent.setup();

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const vividButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Vivid' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			if ( vividButton ) {
				await user.click( vividButton );
			}

			expect( mockSetSelectedStyle ).toHaveBeenCalledWith( 'vivid' );
		} );

		it( 'tracks style selection with correct parameters', async () => {
			const user = userEvent.setup();

			render( <StylePicker mode={ ImageStudioMode.Edit } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const animeButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Anime' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			if ( animeButton ) {
				await user.click( animeButton );
			}

			expect( mockTrackStyleSelected ).toHaveBeenCalledWith( {
				style: 'anime',
				mode: ImageStudioMode.Edit,
			} );
		} );

		it( 'closes dropdown after style selection', async () => {
			const user = userEvent.setup();

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const vividButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Vivid' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			if ( vividButton ) {
				await user.click( vividButton );
			}

			await waitFor( () => {
				expect( requestAnimationFrame ).toHaveBeenCalled();
			} );

			await waitFor( () => {
				expect( document.body.dispatchEvent ).toHaveBeenCalledWith(
					expect.objectContaining( {
						type: 'mousedown',
						bubbles: true,
						cancelable: true,
					} )
				);
			} );
		} );

		it( 'updates selected style in different modes', async () => {
			const user = userEvent.setup();

			// Test Generate mode
			const { rerender } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const photographicButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Photographic' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			if ( photographicButton ) {
				await user.click( photographicButton );
			}

			expect( mockTrackStyleSelected ).toHaveBeenCalledWith( {
				style: 'photographic',
				mode: ImageStudioMode.Generate,
			} );

			// Close dropdown before rerender (mock dropdown doesn't auto-close)
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			// Test Edit mode
			rerender( <StylePicker mode={ ImageStudioMode.Edit } /> );

			// Open dropdown after rerender
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const digitalArtButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Digital Art' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			if ( digitalArtButton ) {
				await user.click( digitalArtButton );
			}

			expect( mockTrackStyleSelected ).toHaveBeenCalledWith( {
				style: 'digital-art',
				mode: ImageStudioMode.Edit,
			} );
		} );
	} );

	describe( 'Style Options', () => {
		it( 'renders all expected style options', async () => {
			const user = userEvent.setup();
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const expectedStyles = [
				'None',
				'Vivid',
				'Anime',
				'Photographic',
				'Digital Art',
				'Comicbook',
				'Fantasy Art',
				'Analog Film',
				'Neonpunk',
				'Isometric',
				'Lowpoly',
				'Origami',
				'Line Art',
				'Craft Clay',
				'Cinematic',
				'3D Model',
				'Pixel Art',
				'Texture',
			];

			const dropdown = screen.getByTestId( 'dropdown-content' );
			expectedStyles.forEach( ( style ) => {
				expect( dropdown ).toHaveTextContent( style );
			} );
		} );

		it( 'maps style values correctly', async () => {
			const user = userEvent.setup();

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Test a few key mappings
			const testCases = [
				{ label: 'None', value: '' },
				{ label: 'Vivid', value: 'vivid' },
				{ label: '3D Model', value: '3d-model' },
				{ label: 'Pixel Art', value: 'pixel-art' },
			];

			for ( const testCase of testCases ) {
				// Open dropdown for each test
				await user.click( screen.getByTestId( 'toolbar-button' ) );

				const button = screen
					.getAllByRole( 'button' )
					.find(
						( btn ) =>
							btn.textContent?.includes( testCase.label ) &&
							btn.getAttribute( 'data-testid' ) !== 'toolbar-button'
					);

				if ( button ) {
					await user.click( button );
					// eslint-disable-next-line jest/no-conditional-expect
					expect( mockSetSelectedStyle ).toHaveBeenCalledWith( testCase.value );
				}

				// Reset for next iteration
				jest.clearAllMocks();
			}
		} );
	} );

	describe( 'State Synchronization', () => {
		it( 'updates label when selected style changes', () => {
			const { rerender } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// When selectedStyle is '', it matches the 'None' option
			expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'None' );

			// Update selected style
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getSelectedStyle: () => 'cinematic',
				} ) );
				return result;
			} );

			rerender( <StylePicker mode={ ImageStudioMode.Generate } /> );

			expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'Cinematic' );
		} );

		it( 'handles unknown selected style gracefully', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getSelectedStyle: () => 'non-existent-style',
				} ) );
				return result;
			} );

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Should fall back to 'Styles' when value doesn't match any option
			const toolbarButton = screen.getByTestId( 'toolbar-button' );
			expect( toolbarButton ).toHaveTextContent( 'Styles' );
		} );

		it( 'reflects selection state across multiple instances', async () => {
			const user = userEvent.setup();
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getSelectedStyle: () => 'anime',
				} ) );
				return result;
			} );

			const { container: container1 } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );
			const { container: container2 } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdowns to render style option buttons
			const toolbarButtons = screen.getAllByTestId( 'toolbar-button' );
			await user.click( toolbarButtons[ 0 ] );
			await user.click( toolbarButtons[ 1 ] );

			// Both instances should show the same selected state
			const selectedButtons1 = container1.querySelectorAll( '.is-selected' );
			const selectedButtons2 = container2.querySelectorAll( '.is-selected' );

			expect( selectedButtons1.length ).toBeGreaterThan( 0 );
			expect( selectedButtons2.length ).toBeGreaterThan( 0 );
		} );
	} );

	describe( 'Accessibility', () => {
		it( 'uses button elements for style options', async () => {
			const user = userEvent.setup();
			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const styleButtons = screen.getAllByRole( 'button' ).filter( ( button ) => {
				return button.querySelector( 'img' ) !== null;
			} );

			styleButtons.forEach( ( button ) => {
				expect( button ).toHaveAttribute( 'type', 'button' );
			} );
		} );

		it( 'provides empty alt text for decorative images', async () => {
			const user = userEvent.setup();
			const { container } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			// Images with alt="" are presentational, so use DOM query instead of getByRole('img')
			const images = container.querySelectorAll( 'img' );
			expect( images.length ).toBeGreaterThan( 0 );

			images.forEach( ( img ) => {
				expect( img ).toHaveAttribute( 'alt', '' );
			} );
		} );
	} );

	describe( 'Edge Cases', () => {
		it( 'handles rapid style selection', async () => {
			const user = userEvent.setup();

			render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			// Open dropdown and click Vivid
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const vividButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Vivid' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			expect( vividButton ).toBeDefined();
			await user.click( vividButton! );

			// The mock InputToolbar toggles on button click. After clicking a style,
			// the dropdown may still be open (mock doesn't handle the requestAnimationFrame close).
			// Close and reopen to ensure a fresh dropdown.
			await user.click( screen.getByTestId( 'toolbar-button' ) );
			await user.click( screen.getByTestId( 'toolbar-button' ) );

			const animeButton = screen
				.getAllByRole( 'button' )
				.find(
					( button ) =>
						button.textContent?.includes( 'Anime' ) &&
						button.getAttribute( 'data-testid' ) !== 'toolbar-button'
				);

			expect( animeButton ).toBeDefined();
			await user.click( animeButton! );

			expect( mockSetSelectedStyle ).toHaveBeenCalledTimes( 2 );
			expect( mockSetSelectedStyle ).toHaveBeenNthCalledWith( 1, 'vivid' );
			expect( mockSetSelectedStyle ).toHaveBeenNthCalledWith( 2, 'anime' );
		} );

		it( 'maintains state when mode changes', () => {
			mockUseSelect.mockImplementation( ( selector: any ) => {
				const result = selector( () => ( {
					getSelectedStyle: () => 'vivid',
				} ) );
				return result;
			} );

			const { rerender } = render( <StylePicker mode={ ImageStudioMode.Generate } /> );

			expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'Vivid' );

			// Change mode
			rerender( <StylePicker mode={ ImageStudioMode.Edit } /> );

			// Selected style should remain
			expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'Vivid' );
		} );
	} );
} );
