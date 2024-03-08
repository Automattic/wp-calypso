import { getVideoPressUploadTask } from '../';
import { buildSiteDetails, buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getVideoPressUploadTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'doesnt use the calypso path', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( { siteSlug } );

		expect( getVideoPressUploadTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			actionUrl: `/site-editor/${ siteSlug }?canvas=edit`,
			calypso_path: `/site-editor/${ siteSlug }?canvas=edit`,
		} );
	} );

	it( 'disables the task when the upload was completed', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( {
			siteSlug,
			tasks: [ buildTask( { id: 'video_uploaded', completed: true } ) ],
		} );

		expect( getVideoPressUploadTask( task, 'flowId', context ) ).toMatchObject( {
			disabled: true,
		} );
	} );

	it( 'returns the front_page when there is one set', () => {
		const siteSlug = 'site.wordpress.com';
		const site = buildSiteDetails( { options: { page_on_front: 'Home' } } );
		const context = buildContext( {
			siteSlug,
			site,
			tasks: [ buildTask( { id: 'video_uploaded', completed: true } ) ],
		} );

		expect( getVideoPressUploadTask( task, 'flowId', context ) ).toMatchObject( {
			calypso_path: `/page/${ siteSlug }/Home`,
		} );
	} );
} );
