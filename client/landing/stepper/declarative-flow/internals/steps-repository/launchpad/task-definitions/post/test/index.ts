/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
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

	it( 'returns the calypso_path provided by the server', () => {
		const context = buildContext( { siteSlug: 'site.wordpress.com' } );

		expect( getFirstPostPublished( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: 'some-path',
		} );
	} );

	it( 'disables when is a newsletter flow and the emails is not verified', () => {
		const context = buildContext( {
			siteSlug: 'site.wordpress.com',
			isEmailVerified: false,
		} );

		expect( getFirstPostPublished( task, NEWSLETTER_FLOW, context ) ).toMatchObject( {
			disabled: true,
		} );
	} );

	it( 'appends an `origin` param to calypso_path when it is a blog onboarding flow', () => {
		const context = buildContext( {
			isEmailVerified: false,
		} );

		expect( getFirstPostPublished( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			calypso_path: `some-path?origin=${ encodeURIComponent( window.location.origin ) }`,
		} );
	} );
} );
