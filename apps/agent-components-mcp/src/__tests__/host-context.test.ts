import { applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { createHostContextPresenter } from '../host-context';

jest.mock(
	'@modelcontextprotocol/ext-apps',
	() => ( {
		applyDocumentTheme: jest.fn( ( theme: string ) => {
			globalThis.document.documentElement.dataset.theme = theme;
			globalThis.document.documentElement.style.colorScheme = theme;
		} ),
		applyHostStyleVariables: jest.fn( ( variables: Record< string, string | undefined > ) => {
			for ( const [ key, value ] of Object.entries( variables ) ) {
				if ( value !== undefined ) {
					globalThis.document.documentElement.style.setProperty( key, value );
				}
			}
		} ),
	} ),
	{ virtual: true }
);

afterEach( () => {
	document.documentElement.removeAttribute( 'style' );
	document.documentElement.removeAttribute( 'lang' );
	document.documentElement.removeAttribute( 'dir' );
	delete document.documentElement.dataset.theme;
	jest.clearAllMocks();
} );

it( 'applies missing-locale defaults and supports RTL host direction', () => {
	const present = createHostContextPresenter();
	present();
	expect( document.documentElement.lang ).toBe( 'en' );
	expect( document.documentElement.dir ).toBe( 'ltr' );
	expect( applyDocumentTheme ).toHaveBeenLastCalledWith( 'light' );
	present( { locale: 'ar-SA' } );
	expect( document.documentElement.lang ).toBe( 'ar-SA' );
	expect( document.documentElement.dir ).toBe( 'rtl' );
	present( { direction: 'ltr' } );
	expect( document.documentElement.dir ).toBe( 'ltr' );
} );

it( 'merges host tokens across theme updates and honors container constraints', () => {
	const present = createHostContextPresenter();
	const initial = {
		locale: 'es',
		theme: 'light' as const,
		styles: { variables: { '--color-background-primary': '#fff', '--font-sans': 'Host Sans' } },
		containerDimensions: { maxWidth: 280, maxHeight: 400 },
	};
	present( initial );
	const context = present( {
		theme: 'dark',
		styles: { variables: { '--color-text-primary': '#eee' } },
	} );
	expect( context.styles?.variables ).toEqual( {
		'--color-background-primary': '#fff',
		'--color-text-primary': '#eee',
		'--font-sans': 'Host Sans',
	} );
	expect( applyHostStyleVariables ).toHaveBeenLastCalledWith( context.styles?.variables );
	expect( document.documentElement.style.getPropertyValue( '--agent-components-background' ) ).toBe(
		'var(--color-background-primary)'
	);
	expect( document.documentElement.style.getPropertyValue( '--agent-components-foreground' ) ).toBe(
		'var(--color-text-primary)'
	);
	expect( document.documentElement.style.fontFamily ).toBe( 'var(--font-sans)' );
	expect( document.documentElement.style.maxWidth ).toBe( '280px' );
	expect( document.documentElement.style.maxHeight ).toBe( '400px' );
	expect( document.documentElement.style.overflowY ).toBe( 'auto' );
	expect( document.documentElement.dataset.theme ).toBe( 'dark' );
	expect( initial.styles.variables ).toEqual( {
		'--color-background-primary': '#fff',
		'--font-sans': 'Host Sans',
	} );
	present( { styles: { variables: { '--color-background-primary': undefined } } } );
	expect( document.documentElement.style.getPropertyValue( '--color-background-primary' ) ).toBe(
		''
	);
	expect( document.documentElement.style.getPropertyValue( '--agent-components-background' ) ).toBe(
		''
	);
} );
