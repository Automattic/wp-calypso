import { getLastActionRequiresLogin } from '../selectors';

const lastAction = {
	type: 'like',
	siteId: 123,
	postId: 456,
};
describe( 'selectors', () => {
	describe( 'getLastActionRequiresLogin()', () => {
		test( 'should return null if empty state provided', () => {
			const lastActionRequiresLogin = getLastActionRequiresLogin( {
				readerUi: { lastActionRequiresLogin: null },
			} );

			expect( lastActionRequiresLogin ).toBeNull();
		} );

		test( 'should return null if lastActionRequiresLogin not available', () => {
			const lastActionRequiresLogin = getLastActionRequiresLogin( { readerUi: {} } );

			expect( lastActionRequiresLogin ).toBeNull();
		} );

		test( 'should return data', () => {
			const lastActionRequiresLogin = getLastActionRequiresLogin(
				{
					readerUi: {
						lastActionRequiresLogin: lastAction,
					},
				},
				1
			);

			expect( lastActionRequiresLogin ).toEqual( lastAction );
		} );
	} );
} );
