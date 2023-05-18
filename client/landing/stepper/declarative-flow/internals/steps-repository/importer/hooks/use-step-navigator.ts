import { getWpOrgImporterUrl } from 'calypso/blocks/import/util';
import { useCheckoutUrl } from 'calypso/blocks/importer/hooks/use-checkout-url';
import { WPImportOption } from 'calypso/blocks/importer/wordpress/types';
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
	const checkoutUrl = useCheckoutUrl( siteId, siteSlug );

	function navigator( path: string ) {
		const stepPath = removeLeadingSlash( path.replace( `${ BASE_STEPPER_ROUTE }/${ flow }`, '' ) );
		navigation.goToStep?.( stepPath as string );
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

	function goToCheckoutPage( extraArgs = {} ) {
		navigation.submit?.( {
			type: 'redirect',
			url: getCheckoutUrl( extraArgs ),
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
			run: true,
			...extraArgs,
		};

		return addQueryArgs( queryParams, `/${ BASE_STEPPER_ROUTE }/${ flow }/importerWordpress` );
	}

	function getCheckoutUrl( extraArgs = {} ) {
		const path = checkoutUrl;
		const queryParams = {
			redirect_to: getWordpressImportEverythingUrl( extraArgs ),
			cancel_to: getWordpressImportEverythingUrl(),
		};

		return addQueryArgs( queryParams, path );
	}

	function goToAddDomainPage() {
		navigation.submit?.( {
			type: 'redirect',
			url: `/domains/add/${ siteSlug }`,
		} );
	}

	return {
		supportLinkModal: false,
		goToIntentPage,
		goToImportCapturePage,
		goToSiteViewPage,
		goToCheckoutPage,
		goToWpAdminImportPage,
		goToWpAdminWordPressPluginPage,
		goToAddDomainPage,
		navigate: ( path ) => navigator( path ),
	};
}
