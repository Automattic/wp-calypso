import { TestAccount } from '@automattic/calypso-e2e';
import { test as base } from '@playwright/test';

export const test = base.extend< {
	accountGutenbergSimple: TestAccount;
} >( {
	// eslint-disable-next-line no-empty-pattern
	accountGutenbergSimple: async ( {}, use ) => {
		const testAccount = new TestAccount( 'gutenbergSimpleSiteUser' );
		await use( testAccount );
	},
} );
