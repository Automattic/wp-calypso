import { getWpOrgImporterUrl } from 'calypso/blocks/import/util';
import { buildCheckoutUrl } from 'calypso/blocks/importer/util';
import { useSelectedPlanUpgradeQuery } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { addQueryArgs } from 'calypso/lib/route';
import { BASE_STEPPER_ROUTE } from '../../import/config';
import { removeLeadingSlash } from '../../import/util';
import type { NavigationControls } from '../../../types';
import type { StepNavigator } from 'calypso/blocks/importer/types';

export function useStepNavigator(
	flow: string | null,
	navigation: NavigationControls<
		| {
				type: 'redirect';
				url: string;
		  }
		| {
				action: 'verify-email';
		  }
	>,
	siteId: number | undefined | null,
	siteSlug: string | undefined | null,
	site: { options?: { admin_url?: string } } | undefined | null,
	fromSite: string | undefined | null
): StepNavigator {
	const { data: selectedPlan } = useSelectedPlanUpgradeQuery();

	function navigator( path: string ) {
		const stepPath = removeLeadingSlash( path.replace( `${ BASE_STEPPER_ROUTE }/${ flow }`, '' ) );
		navigation.goToStep?.( stepPath as string );
	}

	function goToIntentPage() {
		navigation.goToStep?.( 'intent' );
	}

	function goToGoalsPage() {
		navigation.goToStep?.( 'goals' );
	}

	function goToImportCapturePage() {
		navigation.goToStep?.( 'import' );
	}

	function goToImportContentOnlyPage() {
		navigator( getWordpressImportContentOnlyUrl() );
	}

	function goToAdmin() {
		navigation.submit?.( {
			type: 'redirect',
			url: site?.options?.admin_url ?? `/home/${ siteId || siteSlug || '' }`,
		} );
	}

	function goToCheckoutPage( extraArgs = {} ) {
		navigation.submit?.( {
			type: 'redirect',
			url: getCheckoutUrl( extraArgs ),
		} );
	}

	function goToDashboardPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: '/',
		} );
	}

	function goToWpAdminImportPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: `/import/${ siteSlug || '' }`,
		} );
	}

	function goToWpAdminWordPressPluginPage() {
		if ( ! siteSlug ) {
			throw new Error( 'Cannot go to wp-admin plugin page without a site slug' );
		}
		navigation.submit?.( {
			type: 'redirect',
			url: getWpOrgImporterUrl( siteSlug, 'wordpress' ),
		} );
	}

	function getWordpressImportContentOnlyUrl( extraArgs = {} ): string {
		const queryParams = {
			siteSlug: siteSlug,
			...extraArgs,
		};

		return addQueryArgs( queryParams, `/${ BASE_STEPPER_ROUTE }/${ flow }/importerWordpress` );
	}

	function getCheckoutUrl(
		extraArgs: { plan?: string; slug?: string; redirect_to?: string } = {}
	) {
		const plan = extraArgs.plan ?? selectedPlan;
		const slug = extraArgs.slug ?? siteSlug;
		const path = buildCheckoutUrl( slug, plan );

		return addQueryArgs(
			{
				redirect_to: extraArgs.redirect_to ?? getWordpressImportContentOnlyUrl( extraArgs ),
				cancel_to: getWordpressImportContentOnlyUrl(),
			},
			path
		);
	}

	function goToAddDomainPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: `/domains/add/${ siteSlug }`,
		} );
	}

	function goToVerifyEmailPage() {
		navigation.submit?.( { action: 'verify-email' } );
	}

	function goToSitePickerPage() {
		navigation.goToStep?.( `sitePicker?from=${ fromSite }` );
	}

	return {
		flow,
		supportLinkModal: false,
		goToIntentPage,
		goToGoalsPage,
		goToImportCapturePage,
		goToImportContentOnlyPage,
		goToAdmin,
		goToDashboardPage,
		goToCheckoutPage,
		goToWpAdminImportPage,
		goToWpAdminWordPressPluginPage,
		goToAddDomainPage,
		goToSitePickerPage,
		goToVerifyEmailPage,
		navigate: ( path ) => navigator( path ),
	};
}
