import { START_WRITING_FLOW, VIDEOPRESS_FLOW } from '@automattic/onboarding';
import { getPlanSelectedTask } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getPlanSelectedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'returns the plans page', () => {
		const context = buildContext( { siteSlug: 'site.wordpress.com' } );

		expect( getPlanSelectedTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/plans/site.wordpress.com',
		} );
	} );

	it( 'returns the plans page with style customization flag', () => {
		const context = buildContext( {
			siteSlug: 'site.wordpress.com',
			displayGlobalStylesWarning: true,
		} );

		expect( getPlanSelectedTask( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/plans/site.wordpress.com?feature=style-customization',
		} );
	} );

	it( 'returns the plans page with video upload flag', () => {
		const context = buildContext( {
			siteSlug: 'site.wordpress.com',
		} );

		expect( getPlanSelectedTask( task, VIDEOPRESS_FLOW, context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/plans/site.wordpress.com?feature=video-upload',
		} );
	} );

	it( 'returns completed as false when is videopress flow and has no plan cart item', () => {
		const task = buildTask( { completed: true } );

		const context = buildContext( {
			siteSlug: 'site.wordpress.com',
			planCartItem: null,
		} );

		expect( getPlanSelectedTask( task, VIDEOPRESS_FLOW, context ) ).toMatchObject( {
			completed: false,
		} );
	} );
} );
