import { getImportTargetAuthor } from '../importing-pane';

describe( 'getImportTargetAuthor', () => {
	const linked = { ID: 2, linked_user_ID: 1234 };
	const siteOnly = { ID: 3, linked_user_ID: false };
	const atomic = { options: { is_wpcom_atomic: true } };
	const jetpack = { options: { is_wpcom_atomic: false } };

	test( 'uses the WordPress.com ID only for linked users on Atomic sites', () => {
		expect( getImportTargetAuthor( atomic, linked ).ID ).toBe( 1234 );
		expect( getImportTargetAuthor( atomic, siteOnly ).ID ).toBe( 3 );
		expect( getImportTargetAuthor( jetpack, linked ).ID ).toBe( 2 );
	} );
} );
