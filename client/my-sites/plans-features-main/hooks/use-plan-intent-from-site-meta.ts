import { useSiteIntent, Onboard } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import type { PlansIntent } from '@automattic/plans-grid-next';

const { SiteIntent } = Onboard;

interface IntentFromSiteMeta {
	processing: boolean;
	intent: PlansIntent | null | undefined;
}

const usePlanIntentFromSiteMeta = (): IntentFromSiteMeta => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const siteIntentResponse = useSiteIntent( selectedSiteId );

	if ( siteIntentResponse.isFetching ) {
		return {
			processing: true,
			intent: undefined, // undefined -> we haven't observed any metadata yet
		};
	}

	const siteIntent = siteIntentResponse.data?.site_intent;

	// ai-site-builder flow is specifically the free trial for big sky
	if (
		SiteIntent.AIAssembler === siteIntent &&
		selectedSite?.options?.site_creation_flow === 'ai-site-builder'
	) {
		return {
			processing: false,
			intent: 'plans-ai-assembler-free-trial',
		};
	}

	if ( SiteIntent.Newsletter === siteIntent ) {
		return {
			processing: false,
			intent: 'plans-newsletter',
		};
	}

	// @ts-expect-error This is not a valid site intent, apparently. Can we remove it?
	if ( 'videopress' === siteIntent ) {
		return {
			processing: false,
			intent: 'plans-videopress',
		};
	}

	return {
		processing: false,
		intent: null, // null -> we've observed metadata but nothing we care about
	};
};

export default usePlanIntentFromSiteMeta;
