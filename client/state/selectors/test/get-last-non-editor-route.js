/**
 * Internal dependencies
 */
import getLastNonEditorRoute from 'calypso/state/selectors/get-last-non-editor-route';

describe( 'getLastNonEditorRoute()', () => {
	test( 'should return empty if the previous path path is not set', () => {
		const stateIn = {};
		const output = getLastNonEditorRoute( stateIn );
		expect( output ).toBe( '' );
	} );

	test( 'should return previous path if one is found', () => {
		const stateIn = {
			route: {
				lastNonEditorRoute: '/hello',
			},
		};
		const output = getLastNonEditorRoute( stateIn );
		expect( output ).toBe( '/hello' );
	} );
} );
