import { setLocale } from '../../state/ui/language/actions';
import { setLocaleMiddleware } from '../shared';

describe( 'setLocaleMiddleware', () => {
	const next = jest.fn();
	const dispatch = jest.fn();
	let context;
	let middleware;

	beforeEach( () => {
		next.mockClear();
		dispatch.mockClear();
		context = { query: {}, params: {}, store: { dispatch } };
		middleware = setLocaleMiddleware();
	} );

	it( "doesn't dispatch locale event if no language params found", () => {
		middleware( context, next );
		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( context.store.dispatch ).toHaveBeenCalledTimes( 0 );
	} );

	it( 'Dispatch locale event if language param is in URL', () => {
		context.params.lang = 'fr';
		middleware( context, next );
		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( context.store.dispatch ).toHaveBeenCalledTimes( 1 );
		expect( context.store.dispatch ).toHaveBeenCalledWith( setLocale( 'fr' ) );
		expect( context.lang ).toEqual( 'fr' );
	} );

	it( 'Dispatch locale event if language param is query param', () => {
		context.query.lang = 'fr';
		middleware( context, next );
		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( context.store.dispatch ).toHaveBeenCalledTimes( 1 );
		expect( context.store.dispatch ).toHaveBeenCalledWith( setLocale( 'fr' ) );
		expect( context.lang ).toEqual( 'fr' );
	} );
} );
