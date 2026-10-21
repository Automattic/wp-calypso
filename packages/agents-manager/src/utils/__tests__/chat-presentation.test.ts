import { getChatPresentation } from '../chat-presentation';

function setViewport( isDesktop: boolean ) {
	window.matchMedia = jest.fn( ( query: string ) => ( {
		matches: isDesktop,
		media: query,
	} ) ) as unknown as typeof window.matchMedia;
}

describe( 'getChatPresentation', () => {
	afterEach( () => {
		document.body.className = '';
	} );

	it( 'defaults to dismissible without a host config', () => {
		setViewport( true );

		expect( getChatPresentation( undefined ).dismissible ).toBe( true );
	} );

	it( 'keeps the chat locked where it can dock', () => {
		setViewport( true );

		expect( getChatPresentation( { dismissible: false } ).dismissible ).toBe( false );
	} );

	it( 'lets a locked chat be closed on a narrow screen, where it floats', () => {
		setViewport( false );

		expect( getChatPresentation( { dismissible: false } ).dismissible ).toBe( true );
	} );

	it( 'lets a locked chat be closed in an editor outside fullscreen mode', () => {
		setViewport( true );
		document.body.className = 'site-editor-php';

		expect( getChatPresentation( { dismissible: false } ).dismissible ).toBe( true );
	} );
} );
