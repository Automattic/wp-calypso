import { useSiteIntent } from '@automattic/data-stores';
import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Intent } from 'calypso/my-sites/plans-features-main/hooks/use-plan-types-with-intent';

interface IntentFromSiteMeta {
	processing: boolean;
	intent: Intent | null | undefined;
}

const useIntentFromSiteMeta = (): IntentFromSiteMeta => {
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const intent = useSiteIntent( selectedSiteId );

	if ( intent.isFetching ) {
		return {
			processing: true,
			intent: undefined, // undefined -> we haven't observed any metadata yet
		};
	}

	if ( 'newsletter' === ( intent.data?.site_intent as string ) ) {
		return {
			processing: false,
			intent: 'newsletter',
		};
	}

	return {
		processing: false,
		intent: null, // null -> we've observed metadata but nothing we care about
	};
};

export default useIntentFromSiteMeta;
