import { describe, beforeAll } from '@jest/globals';
import { TestAccount, GutenbergEditorPage } from '..';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

type Record = {
	siteType: string;
	accountName: string;
	active: boolean;
};

type CustomRecord = {
	[ key: string ]: any;
};

type MergedRecord< T extends {} > = Record & T;

type WrappedTestCallback< T > = ( varScope: VarScope, target: MergedRecord< T > ) => void;

type VarScope = { page: Page; testAccount: TestAccount; gutenbergEditorPage: GutenbergEditorPage };

export function testMultiTarget< T extends CustomRecord >(
	targets: Record[],
	additionalRecords?: T[]
) {
	let records = targets as MergedRecord< T >[];

	if ( additionalRecords ) {
		records = targets.map( ( target, i ) => ( {
			...target,
			...additionalRecords[ i ],
		} ) );
	}

	const activeTargets = records.filter( ( record ) => record.active );

	// TODO Return a wrapper around describe.each instead?
	return ( description: string, wrappedTestCb: WrappedTestCallback< T > ) => {
		describe.each( activeTargets )( description, function ( argsFromTable: MergedRecord< T > ) {
			let page: Page;
			let gutenbergEditorPage: GutenbergEditorPage;
			let varScope: VarScope = {} as any;

			// common/shared beforeAll
			beforeAll( async () => {
				page = await browser.newPage();
				gutenbergEditorPage = new GutenbergEditorPage( page );
				const testAccount = new TestAccount( argsFromTable.accountName );
				await testAccount.authenticate( page );

				// Modifying the object is used as a way to pass these vars
				// as "reference" so that they can be accessed later by
				// the tests defined in the `wrappedTestCb` function. This
				// is needed due to the way Jest runs `beforeAll` asynchonously.
				varScope.page = page;
				varScope.gutenbergEditorPage = gutenbergEditorPage;
				varScope.testAccount = testAccount;
			} );

			wrappedTestCb( varScope, argsFromTable );
		} );
	};
}

export function testAcrossSimpleAndAtomic< T extends CustomRecord >(
	additionalRecords?: T[],
	simple: boolean = true,
	atomic: boolean = true
) {
	const defaultTargets = [
		{ siteType: 'Simple', accountName: 'gutenbergUpgradeEdgeUser', active: simple },
		{ siteType: 'Atomic', accountName: 'gutenbergAtomicSiteEdgeUser', active: atomic },
	];

	return testMultiTarget( defaultTargets, additionalRecords );
}
