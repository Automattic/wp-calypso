/**
 * Internal dependencies
 */
import Listener from '../listener';

describe( 'Listener', () => {
	const createHandler = () => ( { handleEvent: jest.fn() } );

	let listener, _addEventListener, _removeEventListener;
	beforeAll( () => {
		_addEventListener = global.window.addEventListener;
		_removeEventListener = global.window.removeEventListener;
		global.window.addEventListener = jest.fn();
		global.window.removeEventListener = jest.fn();
	} );

	beforeEach( () => {
		listener = new Listener();
		jest.clearAllMocks();
	} );

	afterAll( () => {
		global.window.addEventListener = _addEventListener;
		global.window.removeEventListener = _removeEventListener;
	} );

	describe( '#add()', () => {
		it( 'adds an event listener on first listener', () => {
			listener.add( 'resize', createHandler() );

			expect( window.addEventListener ).toHaveBeenCalledWith( 'resize', expect.any( Function ) );
		} );

		it( 'does not add event listener on subsequent listeners', () => {
			listener.add( 'resize', createHandler() );
			listener.add( 'resize', createHandler() );

			expect( window.addEventListener ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( '#remove()', () => {
		it( 'removes an event listener on last listener', () => {
			const handler = createHandler();
			listener.add( 'resize', handler );
			listener.remove( 'resize', handler );

			expect( window.removeEventListener ).toHaveBeenCalledWith( 'resize', expect.any( Function ) );
		} );

		it( 'does not remove event listener on remaining listeners', () => {
			const firstHandler = createHandler();
			const secondHandler = createHandler();
			listener.add( 'resize', firstHandler );
			listener.add( 'resize', secondHandler );
			listener.remove( 'resize', firstHandler );

			expect( window.removeEventListener ).not.toHaveBeenCalled();
		} );
	} );

	describe( '#handleEvent()', () => {
		it( 'calls concerned listeners', () => {
			const handler = createHandler();
			listener.add( 'resize', handler );

			const event = { type: 'resize' };

			listener.handleEvent( event );

			expect( handler.handleEvent ).toHaveBeenCalledWith( event );
		} );

		it( 'calls all added handlers', () => {
			const handler = createHandler();
			listener.add( 'resize', handler );
			listener.add( 'resize', handler );
			listener.add( 'resize', handler );

			const event = { type: 'resize' };

			listener.handleEvent( event );

			expect( handler.handleEvent ).toHaveBeenCalledTimes( 3 );
		} );
	} );
} );
