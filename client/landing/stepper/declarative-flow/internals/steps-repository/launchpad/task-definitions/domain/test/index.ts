import { AI_ASSEMBLER_FLOW, START_WRITING_FLOW } from '@automattic/onboarding';
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
		const context = buildContext( { siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' } } );

		expect( getDomainUpSellTask( task, 'flowId', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path: '/domains/manage/site.wordpress.com',
		} );
	} );

	it( 'returns the setup domain page when the flow is blog onboarding', () => {
		const context = buildContext( { siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' } } );

		expect( getDomainUpSellTask( task, START_WRITING_FLOW, context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path:
				'/setup/start-writing/domains?siteSlug=site.wordpress.com&flowToReturnTo=start-writing&domainAndPlanPackage=true',
		} );
	} );

	it( 'use the setup domain page when the flow is site assembler onboarding', () => {
		const context = buildContext( { siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' } } );

		expect( getDomainUpSellTask( task, AI_ASSEMBLER_FLOW, context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path:
				'/setup/ai-assembler/domains?siteSlug=site.wordpress.com&flowToReturnTo=ai-assembler&domainAndPlanPackage=true',
		} );
	} );

	it( 'use domain upsell page when site is free', () => {
		const freeSite = buildSiteDetails( { name: 'paid-site' } );
		freeSite.plan.is_free = true;

		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' },
			site: freeSite,
		} );

		expect( getDomainUpSellTask( task, 'flow', context ) ).toMatchObject( {
			useCalypsoPath: true,
			calypso_path:
				'/setup/domain-upsell/domains?siteSlug=site.wordpress.com&flowToReturnTo=flow&new=paid-site',
		} );
	} );

	it( 'badge_text is "Upgrade plan" when the site is free and is not a onboarding flow', () => {
		const freeSite = buildSiteDetails( { name: 'paid-site' } );
		freeSite.plan.is_free = true;

		const context = buildContext( {
			siteInfoQueryArgs: { siteSlug: 'site.wordpress.com' },
			site: freeSite,
		} );

		expect( getDomainUpSellTask( task, 'flow', context ) ).toMatchObject( {
			badge_text: 'Upgrade plan',
		} );
	} );
} );
