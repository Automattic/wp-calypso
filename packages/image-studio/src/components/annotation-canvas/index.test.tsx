import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import { store as imageStudioStore } from '../../store';
import AnnotationCanvas from './index';

const mockStoreState: { annotationCanvasRef: any } = {
	annotationCanvasRef: null,
};

const mockSetAnnotationCanvasRef = jest.fn( ( ref ) => {
	mockStoreState.annotationCanvasRef = ref;
} );

jest.mock( '@wordpress/data', () => {
	const mockSelect = jest.fn( ( storeName ) => {
		if ( storeName === 'image-studio' ) {
			return {
				getAnnotationCanvasRef: () => mockStoreState.annotationCanvasRef,
			};
		}
		return {};
	} );

	return {
		useDispatch: jest.fn( ( storeName ) => {
			if ( storeName === 'image-studio' ) {
				return {
					setAnnotationCanvasRef: mockSetAnnotationCanvasRef,
				};
			}
			return {};
		} ),
		select: mockSelect,
	};
} );

jest.mock( '@wordpress/element', () => ( {
	...jest.requireActual( '@wordpress/element' ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
} ) );

describe( 'AnnotationCanvas', () => {
	let mockImageElement: HTMLImageElement;
	let mockResizeObserver: jest.Mock;
	let mockObserve: jest.Mock;
	let mockDisconnect: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		// Reset store state
		mockStoreState.annotationCanvasRef = null;

		mockImageElement = document.createElement( 'img' );
		mockImageElement.src = 'https://example.com/test-image.jpg';
		mockImageElement.width = 800;
		mockImageElement.height = 600;
		Object.defineProperty( mockImageElement, 'naturalWidth', {
			get: () => 1920,
			configurable: true,
		} );
		Object.defineProperty( mockImageElement, 'naturalHeight', {
			get: () => 1080,
			configurable: true,
		} );
		Object.defineProperty( mockImageElement, 'clientWidth', {
			get: () => 800,
			configurable: true,
		} );
		Object.defineProperty( mockImageElement, 'clientHeight', {
			get: () => 600,
			configurable: true,
		} );
		Object.defineProperty( mockImageElement, 'getBoundingClientRect', {
			value: jest.fn( () => ( {
				left: 0,
				top: 0,
				width: 800,
				height: 600,
			} ) ),
			configurable: true,
		} );

		mockObserve = jest.fn();
		mockDisconnect = jest.fn();
		mockResizeObserver = jest.fn( () => ( {
			observe: mockObserve,
			disconnect: mockDisconnect,
		} ) );
		global.ResizeObserver = mockResizeObserver as any;

		HTMLCanvasElement.prototype.getContext = jest.fn( ( type: string ) => {
			if ( type === '2d' ) {
				return {
					clearRect: jest.fn(),
					drawImage: jest.fn(),
					beginPath: jest.fn(),
					moveTo: jest.fn(),
					lineTo: jest.fn(),
					stroke: jest.fn(),
					save: jest.fn(),
					restore: jest.fn(),
					fillStyle: '',
					fillRect: jest.fn(),
				} as any;
			}
			return null;
		} );

		HTMLCanvasElement.prototype.toBlob = jest.fn( ( callback ) => {
			const blob = new Blob( [ 'test' ], { type: 'image/png' } );
			setTimeout( () => callback( blob ), 0 );
		} );

		HTMLCanvasElement.prototype.setPointerCapture = jest.fn();
		HTMLCanvasElement.prototype.releasePointerCapture = jest.fn();

		Object.defineProperty( HTMLCanvasElement.prototype, 'width', {
			writable: true,
			configurable: true,
			value: 0,
		} );
		Object.defineProperty( HTMLCanvasElement.prototype, 'height', {
			writable: true,
			configurable: true,
			value: 0,
		} );
	} );

	afterEach( () => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'renders two canvas elements', () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			const canvases = container.querySelectorAll( '.annotation-canvas' );
			expect( canvases ).toHaveLength( 2 );
			expect( canvases[ 0 ] ).toHaveClass( 'annotation-canvas-committed' );
			expect( canvases[ 1 ] ).toHaveClass( 'annotation-canvas-live' );
		} );
	} );

	describe( 'Store', () => {
		it( 'sets canvas methods in store', async () => {
			render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const canvasRef = select( imageStudioStore ).getAnnotationCanvasRef();
			expect( canvasRef ).toEqual( {
				clear: expect.any( Function ),
				getBlob: expect.any( Function ),
				hasAnnotations: expect.any( Function ),
				hasUndoneAnnotations: expect.any( Function ),
				undo: expect.any( Function ),
				redo: expect.any( Function ),
			} );
		} );

		it( 'cleans up store reference on unmount', () => {
			const { unmount } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			unmount();

			expect( mockSetAnnotationCanvasRef ).toHaveBeenLastCalledWith( null );
		} );

		it( 'hasAnnotations returns false when no paths are committed', async () => {
			render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const canvasRef = select( imageStudioStore ).getAnnotationCanvasRef();
			expect( canvasRef?.hasAnnotations() ).toBe( false );
		} );

		it( 'hasAnnotations returns true after drawing', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 10, y: 10 },
					keys: '[MouseLeft>]',
				},
				{
					coords: { x: 200, y: 200 },
				},
				{ keys: '[/MouseLeft]' },
			] );

			jest.runAllTimers();

			const canvasRef = select( imageStudioStore ).getAnnotationCanvasRef();
			expect( canvasRef?.hasAnnotations() ).toBe( true );
		} );

		it( 'clear method resets paths and clears canvases', async () => {
			render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const canvasRef = select( imageStudioStore ).getAnnotationCanvasRef();
			act( () => {
				canvasRef?.clear();
			} );

			expect( canvasRef?.hasAnnotations() ).toBe( false );
		} );

		it( 'undo method removes last path', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 10, y: 10 },
					keys: '[MouseLeft>]',
				},
				{
					coords: { x: 200, y: 200 },
				},
				{ keys: '[/MouseLeft]' },
			] );

			jest.runAllTimers();

			act( () => {
				select( imageStudioStore ).getAnnotationCanvasRef()?.undo();
			} );

			expect( select( imageStudioStore ).getAnnotationCanvasRef()?.hasAnnotations() ).toBe( false );

			expect( select( imageStudioStore ).getAnnotationCanvasRef()?.hasUndoneAnnotations() ).toBe(
				true
			);
		} );

		it( 'redo method adds last undone path', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 10, y: 10 },
					keys: '[MouseLeft>]',
				},
				{
					coords: { x: 200, y: 200 },
				},
				{ keys: '[/MouseLeft]' },
			] );

			jest.runAllTimers();

			act( () => {
				select( imageStudioStore ).getAnnotationCanvasRef()?.undo();
			} );

			act( () => {
				select( imageStudioStore ).getAnnotationCanvasRef()?.redo();
			} );

			expect( select( imageStudioStore ).getAnnotationCanvasRef()?.hasAnnotations() ).toBe( true );

			expect( select( imageStudioStore ).getAnnotationCanvasRef()?.hasUndoneAnnotations() ).toBe(
				false
			);
		} );
	} );

	describe( 'Drawing', () => {
		it( 'starts drawing on pointerDown', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			await user.pointer( {
				target: liveCanvas,
				coords: { x: 10, y: 10 },
				keys: '[MouseLeft]',
			} );

			jest.runAllTimers();

			expect( liveCanvas.setPointerCapture ).toHaveBeenCalled();
		} );

		it( 'redraws canvas on pointerMove', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			const mockLiveContext = {
				clearRect: jest.fn(),
				drawImage: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				stroke: jest.fn(),
				save: jest.fn(),
				restore: jest.fn(),
				fillStyle: '',
				fillRect: jest.fn(),
			};

			( liveCanvas.getContext as jest.Mock ) = jest.fn( ( type: string ) => {
				if ( type === '2d' ) {
					return mockLiveContext;
				}
				return null;
			} );

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 100, y: 100 },
					keys: '[MouseLeft>]',
				},
				{
					coords: { x: 200, y: 200 },
				},
				{
					keys: '[/MouseLeft]',
				},
			] );

			jest.runAllTimers();

			expect( mockLiveContext.clearRect ).toHaveBeenCalled();
			expect( mockLiveContext.beginPath ).toHaveBeenCalled();
			expect( mockLiveContext.lineTo ).toHaveBeenCalled();
			expect( mockLiveContext.stroke ).toHaveBeenCalled();
		} );

		it( 'commits path on pointerUp', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;
			const committedCanvas = container.querySelector(
				'.annotation-canvas-committed'
			) as HTMLCanvasElement;

			const mockCommittedContext = {
				clearRect: jest.fn(),
				drawImage: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				stroke: jest.fn(),
				save: jest.fn(),
				restore: jest.fn(),
				fillStyle: '',
				fillRect: jest.fn(),
			};

			( committedCanvas.getContext as jest.Mock ) = jest.fn( ( type: string ) => {
				if ( type === '2d' ) {
					return mockCommittedContext;
				}
				return null;
			} );

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 100, y: 100 },
					keys: '[MouseLeft>]',
				},
				{
					coords: { x: 200, y: 200 },
				},
				{
					keys: '[/MouseLeft]',
				},
			] );

			jest.runAllTimers();

			expect( mockCommittedContext.beginPath ).toHaveBeenCalled();
			expect( mockCommittedContext.stroke ).toHaveBeenCalled();
			expect( mockCommittedContext.save ).toHaveBeenCalled();
			expect( mockCommittedContext.restore ).toHaveBeenCalled();
			expect( liveCanvas.releasePointerCapture ).toHaveBeenCalledWith( 1 );
		} );

		it( 'commits path on pointerLeave', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;
			const committedCanvas = container.querySelector(
				'.annotation-canvas-committed'
			) as HTMLCanvasElement;
			const mockCommittedContext = {
				clearRect: jest.fn(),
				drawImage: jest.fn(),
				beginPath: jest.fn(),
				moveTo: jest.fn(),
				lineTo: jest.fn(),
				stroke: jest.fn(),
				save: jest.fn(),
				restore: jest.fn(),
				fillStyle: '',
				fillRect: jest.fn(),
			};

			( committedCanvas.getContext as jest.Mock ) = jest.fn( ( type: string ) => {
				if ( type === '2d' ) {
					return mockCommittedContext;
				}
				return null;
			} );

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 100, y: 100 },
					keys: '[MouseLeft>]',
				},
				{ target: document.body }, // change target to trigger pointerLeave
			] );

			jest.runAllTimers();

			expect( mockCommittedContext.beginPath ).toHaveBeenCalled();
			expect( mockCommittedContext.stroke ).toHaveBeenCalled();
			expect( mockCommittedContext.save ).toHaveBeenCalled();
			expect( mockCommittedContext.restore ).toHaveBeenCalled();
			expect( liveCanvas.releasePointerCapture ).toHaveBeenCalledWith( 1 );
		} );
	} );

	describe( 'Canvas', () => {
		it( 'sets up ResizeObserver', () => {
			render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockResizeObserver ).toHaveBeenCalled();
			expect( mockObserve ).toHaveBeenCalledWith( mockImageElement );
		} );

		it( 'disconnects ResizeObserver on unmount', () => {
			const { unmount } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			unmount();

			expect( mockDisconnect ).toHaveBeenCalled();
		} );

		it( 'updates canvas dimensions based on image size', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			const committedCanvas = container.querySelector(
				'.annotation-canvas-committed'
			) as HTMLCanvasElement;
			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			expect( committedCanvas.width ).toBe( 1920 );
			expect( committedCanvas.height ).toBe( 1080 );
			expect( liveCanvas.width ).toBe( 1920 );
			expect( liveCanvas.height ).toBe( 1080 );

			expect( committedCanvas.style.width ).toBe( '800px' );
			expect( committedCanvas.style.height ).toBe( '600px' );
			expect( liveCanvas.style.width ).toBe( '800px' );
			expect( liveCanvas.style.height ).toBe( '600px' );
		} );
	} );

	describe( 'Blob', () => {
		it( 'getBlob returns null when no paths are committed', async () => {
			render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const canvasRef = select( imageStudioStore ).getAnnotationCanvasRef();
			const blob = await canvasRef?.getBlob();

			expect( blob ).toBeNull();
		} );

		it( 'getBlob returns blob after drawing', async () => {
			const { container } = render(
				<AnnotationCanvas
					imageUrl="https://example.com/test.jpg"
					imageElement={ mockImageElement }
				/>
			);

			expect( mockSetAnnotationCanvasRef ).toHaveBeenCalled();

			const liveCanvas = container.querySelector( '.annotation-canvas-live' ) as HTMLCanvasElement;

			const user = userEvent.setup( {
				advanceTimers: jest.advanceTimersByTime,
			} );

			await user.pointer( [
				{
					target: liveCanvas,
					coords: { x: 100, y: 100 },
					keys: '[MouseLeft>]',
				},
				{
					coords: { x: 200, y: 200 },
				},
				{
					keys: '[/MouseLeft]',
				},
			] );

			const canvasRef = select( imageStudioStore ).getAnnotationCanvasRef();
			expect( canvasRef?.hasAnnotations() ).toBe( true );

			const blobPromise = canvasRef?.getBlob();
			jest.runAllTimers();
			const blob = await blobPromise;

			expect( blob ).toBeInstanceOf( Blob );
			expect( blob?.type ).toBe( 'image/png' );
		} );
	} );
} );
