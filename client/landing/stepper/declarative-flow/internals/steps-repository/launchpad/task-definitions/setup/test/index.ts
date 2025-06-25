// @ts-nocheck - TODO: Fix TypeScript issues
import { getSetupBlogTask, getSetupFreeTask, getSetupGeneralTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};
describe( 'getSetupFreeTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'returns the link', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getSetupFreeTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `/setup/flowId/freePostSetup?siteSlug=${ siteSlug }`,
		} );
	} );
} );

describe( 'getSetupBlogTask', () => {
	const calypso_path = 'some-path';
	const task = buildTask( { id: 'task', calypso_path } );

	it( 'returns the link', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getSetupBlogTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `${ calypso_path }?siteSlug=${ siteSlug }`,
		} );
	} );
} );

describe( 'getSetupGeneralTask', () => {
	const calypso_path = 'some-path';
	const task = buildTask( { id: 'task', calypso_path } );

	it( 'returns the link', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getSetupGeneralTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `/setup/update-options/options?siteSlug=${ siteSlug }&flowToReturnTo=flowId`,
		} );
	} );
} );
