import { useSiteIntent } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlansIntent } from '@automattic/plans-grid-next';

interface IntentFromSiteMeta {
	processing: boolean;
	intent: PlansIntent | null | undefined;
}

const usePlanIntentFromSiteMeta = (): IntentFromSiteMeta => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const siteIntent = useSiteIntent( selectedSiteId );

	if ( siteIntent.isFetching ) {
		return {
			processing: true,
			intent: undefined, // undefined -> we haven't observed any metadata yet
		};
	}

	if ( 'newsletter' === ( siteIntent.data?.site_intent as string ) ) {
		return {
			processing: false,
			intent: 'plans-newsletter',
		};
	}

	if ( 'videopress' === ( siteIntent.data?.site_intent as string ) ) {
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
