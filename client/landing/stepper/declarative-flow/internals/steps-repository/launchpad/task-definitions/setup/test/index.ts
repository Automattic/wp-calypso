import {
	getSetupBlogTask,
	getSetupFreeTask,
	getSetupGeneralTask,
	getSetupVideoPressTask,
} from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};
describe( 'getSetupFreeTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'returns the free post setup page', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteInfoQueryArgs: { siteSlug } } );

		expect( getSetupFreeTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `/setup/flowId/freePostSetup?siteSlug=${ siteSlug }`,
		} );
	} );
} );

describe( 'getSetupBlogTask', () => {
	const calypso_path = 'some-path';
	const task = buildTask( { id: 'task', calypso_path } );

	it( 'returns the free post setup page', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteInfoQueryArgs: { siteSlug } } );

		expect( getSetupBlogTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `${ calypso_path }?siteSlug=${ siteSlug }`,
		} );
	} );
} );

describe( 'getSetupVideoPressTask', () => {
	const calypso_path = 'some-path';
	const task = buildTask( { id: 'task', calypso_path } );

	it( 'returns the free post setup page', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteInfoQueryArgs: { siteSlug } } );

		expect( getSetupVideoPressTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `${ calypso_path }?siteSlug=${ siteSlug }`,
		} );
	} );
} );

describe( 'getSetupGeneralTask', () => {
	const calypso_path = 'some-path';
	const task = buildTask( { id: 'task', calypso_path } );

	it( 'returns the free post setup page', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteInfoQueryArgs: { siteSlug } } );

		expect( getSetupGeneralTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: `/setup/update-options/options?siteSlug=${ siteSlug }&flowToReturnTo=flowId`,
		} );
	} );
} );
