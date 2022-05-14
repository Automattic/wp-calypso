import { getWpOrgImporterUrl } from 'calypso/blocks/import/util';
import { useCheckoutUrl } from 'calypso/blocks/importer/hooks/use-checkout-url';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
import { addQueryArgs } from 'calypso/lib/route';
import { StepPath } from '../../../steps-repository';
import { BASE_STEPPER_ROUTE } from '../../import/config';
import { removeLeadingSlash } from '../../import/util';
import type { NavigationControls } from '../../../types';
import type { StepNavigator } from 'calypso/blocks/importer/types';

export function useStepNavigator(
	navigation: NavigationControls,
	siteId: number,
	siteSlug: string,
	fromSite: string
): StepNavigator {
	const checkoutUrl = useCheckoutUrl( siteId as number, siteSlug as string );

	function navigator( path: string ) {
		const stepPath = removeLeadingSlash( path.replace( BASE_STEPPER_ROUTE, '' ) );
		navigation.goToStep?.( stepPath as StepPath );
	}

	function goToIntentPage() {
		navigation.goToStep?.( 'intent' );
	}

	function goToImportCapturePage() {
		navigation.goToStep?.( 'import' );
	}

	function goToSiteViewPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: `/view/${ siteSlug || '' }`,
		} );
	}

	function goToCheckoutPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: getCheckoutUrl(),
		} );
	}

	function goToWpAdminImportPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: `/import/${ siteSlug }`,
		} );
	}

	function goToWpAdminWordPressPluginPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: getWpOrgImporterUrl( siteSlug as string, 'wordpress' ),
		} );
	}

	function getWordpressImportEverythingUrl(): string {
		const queryParams = {
			siteSlug: siteSlug,
			from: fromSite,
			option: WPImportOption.EVERYTHING,
			run: true,
		};

		return addQueryArgs( queryParams, `/${ BASE_STEPPER_ROUTE }/importerWordpress` );
	}

	function getCheckoutUrl() {
		const path = checkoutUrl;
		const queryParams = {
			redirect_to: getWordpressImportEverythingUrl(),
			cancel_to: getWordpressImportEverythingUrl(),
		};

		return addQueryArgs( queryParams, path );
	}

	return {
		goToIntentPage,
		goToImportCapturePage,
		goToSiteViewPage,
		goToCheckoutPage,
		goToWpAdminImportPage,
		goToWpAdminWordPressPluginPage,
		navigate: ( path ) => navigator( path ),
	};
}
