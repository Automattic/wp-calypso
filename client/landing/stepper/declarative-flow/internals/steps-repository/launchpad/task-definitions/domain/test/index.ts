// @ts-nocheck - TODO: Fix TypeScript issues
import { START_WRITING_FLOW } from '@automattic/onboarding';
import { getDomainUpSellTask } from '../';
import { buildSiteDetails, buildTask } from '../../../test/lib/fixtures';
import { type TaskContext } from '../../../types';

const buildContext = ( options?: Partial< TaskContext > ) => {
	return {
		tasks: [],
		...options,
	} as TaskContext;
};
describe( 'getDesignEditedTask', () => {
	const task = buildTask( { id: 'task', calypso_path: 'some-path' } );

	it( 'return the domains manage site page when is not a onboarding flow', () => {
		const context = buildContext( { siteSlug: 'site.wordpress.com' } );

		expect( getDomainUpSellTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/domains/manage/site.wordpress.com',
		} );
	} );

	it( 'returns the setup domain page when the flow is blog onboarding', () => {
		const site = buildSiteDetails( { name: 'site.wordpress.com' } );
		const context = buildContext( { siteSlug: 'site.wordpress.com', site } );

		expect( getDomainUpSellTask( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path:
				'/setup/domain-and-plan?siteSlug=site.wordpress.com&back_to=%2Fsetup%2Fstart-writing%2Flaunchpad%3FsiteSlug%3Dsite.wordpress.com&new=site.wordpress.com',
		} );
	} );

	it( 'use domain upsell page when site is free', () => {
		const freeSite = buildSiteDetails( { name: 'paid-site' } );
		freeSite.plan.is_free = true;

		const context = buildContext( {
			siteSlug: 'site.wordpress.com',
			site: freeSite,
		} );

		expect( getDomainUpSellTask( task, 'flow', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path:
				'/setup/domain-and-plan?siteSlug=site.wordpress.com&back_to=%2Fsetup%2Fflow%2Flaunchpad%3FsiteSlug%3Dsite.wordpress.com&new=paid-site',
		} );
	} );

	it( 'badge_text is "Upgrade plan" when the site is free and is not a onboarding flow', () => {
		const freeSite = buildSiteDetails( { name: 'paid-site' } );
		freeSite.plan.is_free = true;

		const context = buildContext( {
			siteSlug: 'site.wordpress.com',
			site: freeSite,
		} );

		expect( getDomainUpSellTask( task, 'flow', context ) ).toMatchObject( {
			badge_text: 'Upgrade plan',
		} );
	} );
} );
