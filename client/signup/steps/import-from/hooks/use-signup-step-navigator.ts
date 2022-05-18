import page from 'page';
import { addQueryArgs } from 'calypso/lib/route';
import { useCheckoutUrl } from 'calypso/signup/steps/import-from/hooks/use-checkout-url';
import { StepNavigator } from 'calypso/signup/steps/import-from/types';
import { WPImportOption } from 'calypso/signup/steps/import-from/wordpress/types';
import { getWpOrgImporterUrl } from 'calypso/signup/steps/import/util';
import { getStepUrl } from 'calypso/signup/utils';

export function useSignupStepNavigator(
	siteId: number,
	siteSlug: string,
	fromSite: string
): StepNavigator {
	const checkoutUrl = useCheckoutUrl( siteId, siteSlug );

	function goToIntentPage() {
		page( getStepUrl( 'setup-site', 'intent', '', '', { siteSlug } ) );
	}

	function goToImportCapturePage() {
		page( getStepUrl( 'importer', 'capture', '', '', { siteSlug } ) );
	}

	function goToSiteViewPage() {
		page( '/view/' + ( siteSlug || '' ) );
	}

	function goToCheckoutPage() {
		page( getCheckoutUrl() );
	}

	function goToWpAdminImportPage() {
		page( `/import/${ siteSlug }` );
	}

	function goToWpAdminWordPressPluginPage() {
		page( getWpOrgImporterUrl( siteSlug, 'wordpress' ) );
	}

	function getWordpressImportEverythingUrl() {
		const queryParams = {
			from: fromSite,
			to: siteSlug,
			option: WPImportOption.EVERYTHING,
			run: true,
		};

		return getStepUrl( 'from', 'importing', 'wordpress', '', queryParams );
	}

	function getCheckoutUrl() {
		const path = checkoutUrl;
		const queryParams = { redirect_to: getWordpressImportEverythingUrl() };

		return addQueryArgs( queryParams, path );
	}

	return {
		goToIntentPage,
		goToImportCapturePage,
		goToSiteViewPage,
		goToCheckoutPage,
		goToWpAdminImportPage,
		goToWpAdminWordPressPluginPage,
		navigate: ( path: string ) => page( path ),
	};
}
