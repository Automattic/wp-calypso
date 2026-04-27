/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

import { useDispatch, useSelect } from '@wordpress/data';
import { ImageStudioMode } from '../../types';
import { trackImageStudioStyleSelected } from '../../utils/tracking';
import { TONE_OPTIONS, TonePicker } from './index';

const mockUseDispatch = useDispatch as jest.MockedFunction< typeof useDispatch >;
const mockUseSelect = useSelect as jest.MockedFunction< typeof useSelect >;
const mockTrackStyleSelected = trackImageStudioStyleSelected as jest.MockedFunction<
	typeof trackImageStudioStyleSelected
>;

describe( 'TonePicker', () => {
	const mockSetSelectedTone = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		mockUseDispatch.mockReturnValue( {
			setSelectedTone: mockSetSelectedTone,
		} as any );

		mockUseSelect.mockImplementation( ( selector: any ) => {
			const result = selector( () => ( {
				getSelectedTone: () => null,
			} ) );
			return result;
		} );

		global.requestAnimationFrame = jest.fn( ( cb ) => {
			cb( 0 );
			return 0;
		} );

		document.body.dispatchEvent = jest.fn();
	} );

	it( 'exports the two expected tone options', () => {
		expect( TONE_OPTIONS ).toHaveLength( 2 );
		expect( TONE_OPTIONS[ 0 ] ).toMatchObject( { label: 'Informative', value: 'informative' } );
		expect( TONE_OPTIONS[ 1 ] ).toMatchObject( { label: 'Promotional', value: 'promotional' } );
		TONE_OPTIONS.forEach( ( opt ) => expect( opt.preview ).toBeTruthy() );
	} );

	it( 'renders tone picker with default fallback label', () => {
		render( <TonePicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'Tone' );
	} );

	it( 'renders the selected tone label when one is selected', () => {
		mockUseSelect.mockImplementation( ( selector: any ) => {
			const result = selector( () => ( {
				getSelectedTone: () => 'informative',
			} ) );
			return result;
		} );

		render( <TonePicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getByTestId( 'toolbar-button' ) ).toHaveTextContent( 'Informative' );
	} );

	it( 'dispatches setSelectedTone and tracks selection on click', async () => {
		const user = userEvent.setup();
		render( <TonePicker mode={ ImageStudioMode.Generate } /> );

		await user.click( screen.getByTestId( 'toolbar-button' ) );

		const promotionalButton = screen
			.getAllByRole( 'button' )
			.find(
				( button ) =>
					button.textContent?.includes( 'Promotional' ) &&
					button.getAttribute( 'data-testid' ) !== 'toolbar-button'
			);

		expect( promotionalButton ).toBeDefined();
		await user.click( promotionalButton! );

		expect( mockSetSelectedTone ).toHaveBeenCalledWith( 'promotional' );
		expect( mockTrackStyleSelected ).toHaveBeenCalledWith( {
			style: 'tone:promotional',
			mode: ImageStudioMode.Generate,
		} );
	} );

	it( 'disables the picker when disabled prop is true', () => {
		render( <TonePicker mode={ ImageStudioMode.Generate } disabled /> );

		expect( screen.getByTestId( 'toolbar-button' ) ).toBeDisabled();
	} );
} );
