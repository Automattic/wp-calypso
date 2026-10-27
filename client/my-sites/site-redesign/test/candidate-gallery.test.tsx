/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setLocaleData } from '@wordpress/i18n';
import { type ReactElement } from 'react';
import { renderWithProvider as renderWithStore } from 'calypso/test-helpers/testing-library';
import { fetchPreview, type Candidate } from '../api';
import { CandidateGallery } from '../candidate-gallery';

jest.mock( '../api', () => ( {
	...jest.requireActual( '../api' ),
	fetchPreview: jest.fn(),
} ) );

const REDESIGN_ID = 'rd_' + '1'.repeat( 32 );

const candidate = ( n: number, status: Candidate[ 'status' ] = 'succeeded' ): Candidate => ( {
	id: `gen_${ String( n ).padStart( 32, '0' ) }`,
	batch: 1,
	status,
	progress: null,
	error: status === 'failed' ? { code: 'x', message: `Design ${ n } broke.` } : null,
	routes: null,
	route_count: null,
} );

const candidates = ( count: number ) =>
	Array.from( { length: count }, ( _, i ) => candidate( i + 1 ) );

const gallery = ( props: Partial< Parameters< typeof CandidateGallery >[ 0 ] > = {} ) => (
	<CandidateGallery
		siteId={ 1 }
		redesignId={ REDESIGN_ID }
		candidates={ candidates( 4 ) }
		sessionReady
		isChoosing={ false }
		onChoose={ jest.fn() }
		{ ...props }
	/>
);

const renderWithProvider = ( ui: ReactElement ) =>
	renderWithStore( ui, {
		queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
	} );

const position = () => screen.getByText( /^Design \d+ of \d+$/ );
const choose = () => screen.getByRole( 'button', { name: 'Choose this one' } );

const next = () => screen.getByRole( 'button', { name: 'Next design' } );
const previous = () => screen.getByRole( 'button', { name: 'Previous design' } );
const offered = () => waitFor( () => expect( choose() ).not.toHaveAttribute( 'aria-disabled' ) );

// jsdom has no PointerEvent, and without one the pointer type and position are dropped.
class TouchPointerEvent extends MouseEvent {
	pointerType: string;
	constructor( type: string, init: PointerEventInit = {} ) {
		super( type, init );
		this.pointerType = init.pointerType ?? '';
	}
}

describe( 'CandidateGallery', () => {
	const originalPointerEvent = window.PointerEvent;
	beforeAll( () => {
		window.PointerEvent = TouchPointerEvent as unknown as typeof PointerEvent;
	} );
	afterAll( () => {
		window.PointerEvent = originalPointerEvent;
	} );
	beforeEach( () => {
		jest.mocked( fetchPreview ).mockImplementation( ( _site, _id, generationId ) =>
			Promise.resolve( {
				generation_id: generationId,
				path: '/',
				html: generationId,
				routes: [],
			} )
		);
	} );
	afterEach( () => {
		jest.clearAllMocks();
		setLocaleData( { 'text direction\u0004ltr': [ 'ltr' ] } );
	} );

	it.each( [ 1, 2, 4, 8 ] )(
		'shows %d designs as slides with one choice button',
		async ( count ) => {
			const onChoose = jest.fn();
			renderWithProvider( gallery( { candidates: candidates( count ), onChoose } ) );

			await waitFor( () =>
				expect( screen.getAllByTitle( /Preview of design/ ) ).toHaveLength( count )
			);
			expect( position() ).toHaveTextContent( `Design 1 of ${ count }` );
			expect( screen.getByRole( 'group', { name: `Design 1 of ${ count }` } ) ).toHaveAttribute(
				'aria-roledescription',
				'slide'
			);
			expect( screen.queryAllByRole( 'tab' ) ).toHaveLength( 0 );
			expect( screen.getAllByRole( 'button', { name: /Choose/ } ) ).toHaveLength( 1 );
			expect( screen.queryAllByRole( 'button', { name: /(Next|Previous) design/ } ) ).toHaveLength(
				count > 1 ? 2 : 0
			);
			expect( fetchPreview ).toHaveBeenCalledTimes( count );

			await offered();
			await userEvent.click( choose() );
			expect( onChoose ).toHaveBeenCalledWith( candidate( 1 ).id );
		}
	);

	it( 'keeps one toolbar on a sheet that stays put while the designs move under it', async () => {
		const { container } = renderWithProvider( gallery( { candidates: candidates( 8 ) } ) );
		await waitFor( () => expect( screen.getAllByTitle( /Preview of design/ ) ).toHaveLength( 8 ) );
		const frames = screen.getAllByTitle( /Preview of design/ );
		const toolbars = () => container.querySelectorAll( '.site-redesign__toolbar' );
		const toolbar = toolbars()[ 0 ];

		expect( toolbars() ).toHaveLength( 1 );
		expect( toolbar.closest( '.site-redesign__slide' ) ).toBeNull();
		expect( toolbar.querySelector( 'iframe' ) ).toBeNull();
		const [ device, button ] = Array.from( toolbar.children );
		expect(
			within( device as HTMLElement ).getByRole( 'radio', { name: 'Desktop' } )
		).toBeVisible();
		expect( button ).toBe( choose() );

		await userEvent.click( next() );
		await userEvent.click( next() );

		expect( toolbars() ).toHaveLength( 1 );
		expect( toolbars()[ 0 ] ).toBe( toolbar );
		expect( screen.getAllByTitle( /Preview of design/ ) ).toEqual( frames );
		expect( fetchPreview ).toHaveBeenCalledTimes( 8 );
	} );

	it( 'swipes from the preview but not from the toolbar or the buttons', async () => {
		const onChoose = jest.fn();
		const { container } = renderWithProvider( gallery( { onChoose } ) );
		const swipe = ( element: Element, dx: number ) => {
			fireEvent.pointerDown( element, { pointerType: 'touch', clientX: 200, clientY: 200 } );
			fireEvent.pointerUp( element, { pointerType: 'touch', clientX: 200 + dx, clientY: 204 } );
		};
		const activeSlide = () =>
			container.querySelector( '.site-redesign__slide.is-active' ) as HTMLElement;

		swipe( activeSlide(), -120 );
		expect( position() ).toHaveTextContent( 'Design 2 of 4' );
		swipe( screen.getByLabelText( 'Show design 3' ), -120 );
		expect( position() ).toHaveTextContent( 'Design 3 of 4' );
		swipe( activeSlide(), 120 );
		expect( position() ).toHaveTextContent( 'Design 2 of 4' );

		swipe( container.querySelector( '.site-redesign__toolbar' ) as HTMLElement, -120 );
		swipe( choose(), -120 );
		swipe( within( container ).getByRole( 'radio', { name: 'Mobile' } ), 120 );
		swipe( next(), -120 );
		swipe( previous(), 120 );
		expect( position() ).toHaveTextContent( 'Design 2 of 4' );
		expect( onChoose ).not.toHaveBeenCalled();
	} );

	it( 'reaches every design with the side buttons and stops at the ends', async () => {
		renderWithProvider( gallery( { candidates: candidates( 8 ) } ) );

		expect( previous() ).toHaveAttribute( 'aria-disabled', 'true' );
		for ( let n = 2; n <= 8; n++ ) {
			await userEvent.click( next() );
			expect( position() ).toHaveTextContent( `Design ${ n } of 8` );
		}
		expect( next() ).toHaveAttribute( 'aria-disabled', 'true' );
		await userEvent.click( next() );
		expect( position() ).toHaveTextContent( 'Design 8 of 8' );
		await userEvent.click( previous() );
		expect( position() ).toHaveTextContent( 'Design 7 of 8' );
	} );

	it( 'browses with the arrow keys from the page, the gallery and its buttons', async () => {
		const onChoose = jest.fn();
		renderWithProvider( gallery( { candidates: candidates( 8 ), onChoose } ) );

		document.body.focus();
		for ( let n = 2; n <= 8; n++ ) {
			await userEvent.keyboard( '{ArrowRight}' );
			expect( position() ).toHaveTextContent( `Design ${ n } of 8` );
		}
		await userEvent.keyboard( '{ArrowRight}' );
		expect( position() ).toHaveTextContent( 'Design 8 of 8' );

		previous().focus();
		await userEvent.keyboard( '{ArrowLeft}' );
		expect( position() ).toHaveTextContent( 'Design 7 of 8' );

		choose().focus();
		await userEvent.keyboard( '{ArrowLeft}' );
		expect( position() ).toHaveTextContent( 'Design 6 of 8' );

		await userEvent.click( screen.getByLabelText( 'Show design 5' ) );
		expect( position() ).toHaveTextContent( 'Design 5 of 8' );
		await userEvent.keyboard( '{ArrowRight}' );
		expect( position() ).toHaveTextContent( 'Design 6 of 8' );

		expect( onChoose ).not.toHaveBeenCalled();
		await offered();
		await userEvent.click( choose() );
		expect( onChoose ).toHaveBeenCalledTimes( 1 );
		expect( onChoose ).toHaveBeenCalledWith( candidate( 6 ).id );
	} );

	it( 'leaves the arrow keys to other controls and to shortcuts', async () => {
		const { container } = renderWithProvider(
			<>
				<input aria-label="Search" />
				{ gallery() }
			</>
		);

		await userEvent.click( screen.getByRole( 'textbox', { name: 'Search' } ) );
		await userEvent.keyboard( '{ArrowRight}' );
		expect( position() ).toHaveTextContent( 'Design 1 of 4' );

		document.body.focus();
		await userEvent.keyboard( '{Alt>}{ArrowRight}{/Alt}{Shift>}{ArrowRight}{/Shift}' );
		await userEvent.keyboard( '{Meta>}{ArrowRight}{/Meta}{Control>}{ArrowRight}{/Control}' );
		expect( position() ).toHaveTextContent( 'Design 1 of 4' );

		const desktop = within( container ).getByRole( 'radio', { name: 'Desktop' } );
		desktop.focus();
		await userEvent.keyboard( '{ArrowRight}' );
		expect( position() ).toHaveTextContent( 'Design 1 of 4' );
	} );

	it( 'follows the reading direction in right-to-left languages', async () => {
		setLocaleData( { 'text direction\u0004ltr': [ 'rtl' ] } );
		renderWithProvider( gallery() );

		document.body.focus();
		await userEvent.keyboard( '{ArrowLeft}' );
		expect( position() ).toHaveTextContent( 'Design 2 of 4' );
		await userEvent.keyboard( '{ArrowRight}' );
		expect( position() ).toHaveTextContent( 'Design 1 of 4' );
	} );

	it( 'stops listening for the arrow keys once it is gone', async () => {
		const { unmount } = renderWithProvider( gallery() );
		unmount();

		document.body.focus();
		const event = new KeyboardEvent( 'keydown', { key: 'ArrowRight', cancelable: true } );
		act( () => {
			document.body.dispatchEvent( event );
		} );
		expect( event.defaultPrevented ).toBe( false );
	} );

	it( 'keeps the shown design and its frame while the others finish', async () => {
		const pending = [
			candidate( 1, 'running' ),
			candidate( 2 ),
			candidate( 3, 'queued' ),
			candidate( 4, 'running' ),
		];
		const { rerender } = renderWithProvider(
			gallery( { candidates: pending, sessionReady: false } )
		);
		await userEvent.click( next() );
		const frame = await screen.findByTitle( 'Preview of design 2' );
		await waitFor( () =>
			expect( screen.getByText( 'Ready. You can choose once every design is done.' ) ).toBeVisible()
		);
		expect( choose() ).toHaveAttribute( 'aria-disabled', 'true' );

		rerender( gallery( { candidates: candidates( 4 ) } ) );

		await waitFor( () => expect( screen.getAllByTitle( /Preview of design/ ) ).toHaveLength( 4 ) );
		expect( position() ).toHaveTextContent( 'Design 2 of 4' );
		expect( screen.getByTitle( 'Preview of design 2' ) ).toBe( frame );
		await offered();
		expect( fetchPreview ).toHaveBeenCalledTimes( 4 );
	} );

	it( 'holds the first design it showed when the order changes', async () => {
		const onChoose = jest.fn();
		const [ a, b ] = candidates( 2 );
		const { rerender } = renderWithProvider( gallery( { candidates: [ a, b ], onChoose } ) );
		await offered();

		rerender( gallery( { candidates: [ b, a ], onChoose } ) );

		expect( position() ).toHaveTextContent( 'Design 2 of 2' );
		await userEvent.click( choose() );
		expect( onChoose ).toHaveBeenCalledWith( a.id );
	} );

	it( 'holds the design it fell back to when the shown one is gone', async () => {
		const onChoose = jest.fn();
		const [ a, b ] = candidates( 2 );
		const { rerender } = renderWithProvider( gallery( { candidates: [ a, b ], onChoose } ) );
		await userEvent.click( next() );

		rerender( gallery( { candidates: [ a ], onChoose } ) );
		expect( position() ).toHaveTextContent( 'Design 1 of 1' );
		rerender( gallery( { candidates: [ a, b ], onChoose } ) );

		expect( position() ).toHaveTextContent( 'Design 1 of 2' );
		await offered();
		await userEvent.click( choose() );
		expect( onChoose ).toHaveBeenCalledWith( a.id );
	} );

	it( 'offers a design only once its preview is on screen', async () => {
		let showPreview = () => {};
		jest.mocked( fetchPreview ).mockReturnValue(
			new Promise( ( resolve ) => {
				showPreview = () =>
					resolve( { generation_id: candidate( 1 ).id, path: '/', html: 'x', routes: [] } );
			} )
		);
		renderWithProvider( gallery( { candidates: [ candidate( 1 ) ] } ) );

		expect( screen.getByText( 'Loading the preview…' ) ).toBeVisible();
		expect( choose() ).toHaveAttribute( 'aria-disabled', 'true' );

		showPreview();

		await offered();
		expect( screen.getByTitle( 'Preview of design 1' ) ).toHaveClass( 'is-loaded' );
		expect( screen.getByText( 'Ready to choose' ) ).toBeVisible();
	} );

	it( 'reports a preview that failed to load and loads it again on request', async () => {
		const onChoose = jest.fn();
		jest.mocked( fetchPreview ).mockRejectedValueOnce( new Error( 'The preview timed out.' ) );
		renderWithProvider( gallery( { candidates: [ candidate( 1 ) ], onChoose } ) );

		expect( await screen.findByText( 'The preview timed out.' ) ).toBeVisible();
		expect( screen.getByText( 'The preview couldn’t load.' ) ).toBeVisible();
		await userEvent.click( choose() );
		expect( onChoose ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		await offered();
		expect( fetchPreview ).toHaveBeenCalledTimes( 2 );
		await userEvent.click( choose() );
		expect( onChoose ).toHaveBeenCalledWith( candidate( 1 ).id );
	} );

	it( 'does not offer a design that is unfinished or failed', async () => {
		const onChoose = jest.fn();
		renderWithProvider(
			gallery( {
				candidates: [ candidate( 1, 'queued' ), candidate( 2, 'failed' ) ],
				onChoose,
			} )
		);

		expect( screen.getByText( 'Still being made' ) ).toBeVisible();
		await userEvent.click( choose() );
		await userEvent.click( next() );
		expect( screen.getByText( 'Couldn’t be made' ) ).toBeVisible();
		expect( screen.getByText( 'Design 2 broke.' ) ).toBeVisible();
		await userEvent.click( choose() );
		expect( choose() ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( onChoose ).not.toHaveBeenCalled();
	} );

	it( 'holds the button while a choice is being applied', () => {
		renderWithProvider( gallery( { isChoosing: true } ) );

		expect( choose() ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( choose() ).toHaveClass( 'is-busy' );
	} );

	it( 'switches every preview to a phone viewport without reloading it', async () => {
		const { container } = renderWithProvider( gallery() );
		const frame = await screen.findByTitle( 'Preview of design 1' );
		const stage = container.querySelector( '.site-redesign__stage' ) as HTMLElement;
		expect( stage ).toHaveClass( 'is-desktop' );
		expect( stage.style.getPropertyValue( '--site-redesign-frame-width' ) ).toBe( '1280px' );

		await userEvent.click( within( container ).getByRole( 'radio', { name: 'Mobile' } ) );

		expect( stage ).toHaveClass( 'is-mobile' );
		expect( stage.style.getPropertyValue( '--site-redesign-frame-width' ) ).toBe( '390px' );
		expect( stage.style.getPropertyValue( '--site-redesign-frame-height' ) ).toBe( '844px' );
		expect( screen.getByTitle( 'Preview of design 1' ) ).toBe( frame );
		expect( fetchPreview ).toHaveBeenCalledTimes( 4 );
	} );
} );
