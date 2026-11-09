// @ts-nocheck - TODO: Fix TypeScript issues
import { getSetupBlogTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};
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
