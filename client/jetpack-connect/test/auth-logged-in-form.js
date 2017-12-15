/**
 * @format
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import { LoggedInForm } from '../auth-logged-in-form';

describe( 'LoggedInForm', () => {
	describe( 'isSso', () => {
		const isSso = new LoggedInForm().isSso;
		const queryDataSiteId = 12349876;

		test( 'returns true for valid SSO', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( true );
		} );

		test( 'returns false with bad from', () => {
			document.cookie = `jetpack_sso_approved=${ queryDataSiteId };`;
			const props = {
				authQuery: {
					from: 'elsewhere',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false without approved cookie', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: queryDataSiteId,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );

		test( 'returns false with no cookie or queryDataSiteId', () => {
			document.cookie = 'jetpack_sso_approved=;';
			const props = {
				authQuery: {
					from: 'sso',
					clientId: null,
				},
			};
			expect( isSso( props ) ).toBe( false );
		} );
	} );
} );
