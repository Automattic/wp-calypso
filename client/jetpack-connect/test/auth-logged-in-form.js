/**
 * @format
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import { LoggedInForm } from '../auth-logged-in-form';

describe( 'LoggedOutForm', () => {
	describe( 'isSso', () => {
		const isSso = new LoggedInForm().isSso;
		const queryDataSiteId = 12349876;

		test( 'returns true for valid SSO', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authFrom: 'sso',
				authClientId: queryDataSiteId,
			};
			expect( isSso( props ) ).toBe( true );
		} );

		test( 'returns false with bad from', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authFrom: 'elsewhere',
				authClientId: queryDataSiteId,
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false without approved cookie', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				from: 'sso',
				authClientId: queryDataSiteId,
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false with no cookie or queryDataSiteId', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				from: 'sso',
				authClientId: null,
			};
			expect( isSso( props ) ).toBe( false );
		} );
	} );
} );
