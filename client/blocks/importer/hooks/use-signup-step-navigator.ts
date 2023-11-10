import page from '@automattic/calypso-router';
import { getWpOrgImporterUrl } from 'calypso/blocks/import/util';
import { useCheckoutUrl } from 'calypso/blocks/importer/hooks/use-checkout-url';
import { StepNavigator } from 'calypso/blocks/importer/types';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import { addQueryArgs } from 'calypso/lib/route';
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
