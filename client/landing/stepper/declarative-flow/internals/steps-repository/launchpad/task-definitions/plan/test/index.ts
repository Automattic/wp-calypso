import { getPlanSelectedTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getPlanSelectedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'returns the plans page', () => {
		const context = buildContext( { siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' } } );

		expect( getPlanSelectedTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/plans/site.wordpress.com',
		} );
	} );

	it( 'returns the plans page with style customization flag', () => {
		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' },
			shouldDisplayWarning: true,
		} );

		expect( getPlanSelectedTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/plans/site.wordpress.com?feature=style-customization',
		} );
	} );

	it( 'returns the plans page with video upload flag', () => {
		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' },
			shouldDisplayWarning: true,
			isVideoPressFlowWithUnsupportedPlan: true,
		} );

		expect( getPlanSelectedTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/plans/site.wordpress.com?feature=video-upload',
		} );
	} );

	it( 'returns completed as false when isVideoPressFlowWithUnsupportedPlan is true', () => {
		const task = buildTask( { completed: true } );

		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' },
			shouldDisplayWarning: true,
			isVideoPressFlowWithUnsupportedPlan: true,
		} );

		expect( getPlanSelectedTask( task, 'flowId', context ) ).toMatchObject( {
			completed: false,
		} );
	} );
} );
