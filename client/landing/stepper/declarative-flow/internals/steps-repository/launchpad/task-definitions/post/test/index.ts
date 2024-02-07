/**
 * @jest-environment jsdom
 */
import { NEWSLETTER_FLOW, START_WRITING_FLOW } from '@automattic/onboarding';
import { getFirstPostPublished } from '../';
import { buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};

describe( 'getFirstPostPublished', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'returns the plans page', () => {
		const context = buildContext( { siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' } } );

		expect( getFirstPostPublished( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/post/site.wordpress.com',
		} );
	} );

	it( 'disables when is a newsletter flow and the emails is not verified', () => {
		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' },
			isEmailVerified: false,
		} );

		expect( getFirstPostPublished( task, NEWSLETTER_FLOW, context ) ).toMatchObject( {
			disabled: true,
		} );
	} );

	it( 'returns the wp-admin post new page when is a blog onboarding flow', () => {
		const siteSlug = 'site.wordpress.com';
		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug },
			isEmailVerified: false,
		} );

		expect( getFirstPostPublished( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			calypso_path: `https://${ siteSlug }/wp-admin/post-new.php?origin=${ encodeURIComponent(
				window.location.origin
			) }`,
		} );
	} );
} );
