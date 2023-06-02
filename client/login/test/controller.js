import { redirectJetpack } from '../controller';

describe( 'redirectJetpack', () => {
	it( "does not append 'jetpack' to the login path and redirect if it's already present", () => {
		const context = {
			path: '/log-in/jetpack',
			params: { isJetpack: 'test string, not important' },
			query: { redirect_to: 'source=jetpack-plans' },
			redirect: ( path ) => {
				throw new Error( `Browser redirected to unexpected path '${ path }'` );
			},
		};
		const next = jest.fn();

		redirectJetpack( context, next );

		// If a redirect didn't occur, the test passes
		expect( next ).toHaveBeenCalled();
	} );
} );
