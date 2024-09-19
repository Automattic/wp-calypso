import { getWpOrgImporterUrl } from 'calypso/blocks/import/util';
import { buildCheckoutUrl } from 'calypso/blocks/importer/util';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import { useSelectedPlanUpgradeQuery } from 'calypso/data/import-flow/use-selected-plan-upgrade';
import { addQueryArgs } from 'calypso/lib/route';
import { BASE_STEPPER_ROUTE } from '../../import/config';
import { removeLeadingSlash } from '../../import/util';
import type { NavigationControls } from '../../../types';
import type { StepNavigator } from 'calypso/blocks/importer/types';

export function useStepNavigator(
	flow: string | null,
	navigation: NavigationControls,
	siteId: number | undefined | null,
	siteSlug: string | undefined | null,
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

	function goToSiteViewPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: `/view/${ siteId || siteSlug || '' }`,
		} );
	}

	function goToCheckoutPage( importOption: WPImportOption, extraArgs = {} ) {
		navigation.submit?.( {
			type: 'redirect',
			url: getCheckoutUrl( importOption, extraArgs ),
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

	function getWordpressImportEverythingUrl( extraArgs = {} ): string {
		const queryParams = {
			siteSlug: siteSlug,
			from: fromSite,
			option: WPImportOption.EVERYTHING,
			run: false,
			...extraArgs,
		};

		return addQueryArgs( queryParams, `/${ BASE_STEPPER_ROUTE }/${ flow }/importerWordpress` );
	}

	function getWordpressImportContentOnlyUrl( extraArgs = {} ): string {
		const queryParams = {
			siteSlug: siteSlug,
			option: WPImportOption.CONTENT_ONLY,
			...extraArgs,
		};

		return addQueryArgs( queryParams, `/${ BASE_STEPPER_ROUTE }/${ flow }/importerWordpress` );
	}

	function getCheckoutUrl(
		importOption: WPImportOption,
		extraArgs: { plan?: string; slug?: string; redirect_to?: string } = {}
	) {
		const plan = extraArgs.plan ?? selectedPlan;
		const slug = extraArgs.slug ?? siteSlug;
		const path = buildCheckoutUrl( slug, plan );
		let redirectTo = '';
		let cancelTo = '';

		switch ( importOption ) {
			case WPImportOption.CONTENT_ONLY:
				redirectTo = extraArgs.redirect_to ?? getWordpressImportContentOnlyUrl( extraArgs );
				cancelTo = getWordpressImportContentOnlyUrl();
				break;

			case WPImportOption.EVERYTHING:
				redirectTo = extraArgs.redirect_to ?? getWordpressImportEverythingUrl( extraArgs );
				cancelTo = getWordpressImportEverythingUrl();
				break;
		}

		const queryParams = {
			redirect_to: redirectTo,
			cancel_to: cancelTo,
		};

		return addQueryArgs( queryParams, path );
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
		goToSiteViewPage,
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
