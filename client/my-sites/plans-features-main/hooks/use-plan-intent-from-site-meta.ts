import { useSiteIntent, Onboard } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlansIntent } from '@automattic/plans-grid-next';

const { SiteIntent } = Onboard;

interface IntentFromSiteMeta {
	processing: boolean;
	intent: PlansIntent | null | undefined;
}

const usePlanIntentFromSiteMeta = (): IntentFromSiteMeta => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const siteIntentResponse = useSiteIntent( selectedSiteId );

	if ( siteIntentResponse.isFetching ) {
		return {
			processing: true,
			intent: undefined, // undefined -> we haven't observed any metadata yet
		};
	}

	const siteIntent = siteIntentResponse.data?.site_intent;

	if ( SiteIntent.AIAssembler === siteIntent ) {
		return {
			processing: false,
			intent: 'plans-ai-assembler',
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
