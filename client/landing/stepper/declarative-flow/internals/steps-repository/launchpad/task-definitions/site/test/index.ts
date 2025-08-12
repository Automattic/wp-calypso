// @ts-nocheck - TODO: Fix TypeScript issues
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { getBlogLaunchedTask, getSiteLaunchedTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getSiteLaunchedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'doesnt use the calypso path', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getSiteLaunchedTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: false,
		} );
	} );

	it( 'returns disabled when is an blog onboarding flow', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getSiteLaunchedTask( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			disabled: true,
		} );
	} );
} );

describe( 'getBlogLaunchedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'doesnt use the calypso path', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getBlogLaunchedTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: false,
		} );
	} );

	it( 'returns disabled when is an blog onboarding flow', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getBlogLaunchedTask( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			disabled: true,
		} );
	} );
} );
