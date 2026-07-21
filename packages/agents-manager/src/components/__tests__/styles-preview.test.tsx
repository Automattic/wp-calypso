/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StylesPreview from '../styles-preview';

jest.mock( '../../hooks/use-global-styles', () => ( {
	__esModule: true,
	default: () => ( {
		globalStylesId: 'global-styles-1',
		globalStyles: {
			settings: {
				typography: {
					fontFamilies: {
						theme: [ { name: 'Arial', fontFamily: 'Arial, sans-serif' } ],
					},
				},
				color: {
					palette: {
						theme: [
							{ slug: 'primary', color: '#000000' },
							{ slug: 'secondary', color: '#ffffff' },
						],
					},
				},
			},
			styles: {
				typography: {
					fontFamily: 'Arial',
					fontWeight: '400',
					fontStyle: 'normal',
					textTransform: 'none',
				},
				color: {
					text: '#000000',
					background: '#ffffff',
				},
			},
		},
	} ),
} ) );

jest.mock( '../../utils/font-families-to-css', () => ( {
	fontFamiliesToCSS: () => '',
} ) );

jest.mock( '@wordpress/block-editor', () => ( {
	__unstableEditorStyles: ( { styles }: { styles: unknown[] } ) => (
		<div data-testid="mock-editor-styles" data-styles={ JSON.stringify( styles ) } />
	),
	__unstableIframe: ( {
		children,
		...props
	}: {
		children: React.ReactNode;
		[ key: string ]: unknown;
	} ) => (
		<div data-testid="mock-editor-iframe" { ...props }>
			{ children }
		</div>
	),
} ) );

jest.mock( '@wordpress/components', () => ( {
	__experimentalHStack: ( {
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	} ) => <div className={ className }>{ children }</div>,
	__unstableMotion: {
		div: ( { children, ...props }: { children?: React.ReactNode; [ key: string ]: unknown } ) => (
			<div { ...props }>{ children }</div>
		),
	},
	__experimentalVStack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( '@wordpress/compose', () => ( {
	useResizeObserver: () => [ null, { width: 500 } ],
	useThrottle: ( fn: ( ...args: unknown[] ) => void ) => fn,
} ) );

describe( 'StylesPreview', () => {
	it( 'renders without crashing', () => {
		render( <StylesPreview label="Test Label" type="font" /> );
		expect( screen.getByTestId( 'mock-editor-iframe' ) ).toBeInTheDocument();
	} );

	it( 'displays the correct label', () => {
		render( <StylesPreview label="Test Label" type="font" /> );
		expect( screen.getByText( 'Test Label' ) ).toBeInTheDocument();
	} );

	it( 'renders font preview when type is "font"', () => {
		render( <StylesPreview label="Font Preview" type="font" /> );
		expect( screen.getByText( 'A' ) ).toBeInTheDocument();
		const lowercase = screen.getByText( 'a' );
		expect( lowercase ).toBeInTheDocument();
		expect( lowercase ).toHaveStyle( { textTransform: 'none' } );
	} );

	it( 'renders color swatches when type is "color"', () => {
		const { container } = render( <StylesPreview label="Color Preview" type="color" /> );
		// Color swatches are circular divs with `border-radius: 100%`.
		expect( container.querySelector( 'div[style*="border-radius"]' ) ).toBeInTheDocument();
	} );

	it( 'renders button preview when type is "button"', () => {
		const { container } = render( <StylesPreview label="Button Preview" type="button" /> );
		expect( container.querySelector( 'button' ) ).toBeInTheDocument();
	} );
} );
