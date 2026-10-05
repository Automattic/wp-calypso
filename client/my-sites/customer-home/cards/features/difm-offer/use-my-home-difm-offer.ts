import { useLocale } from '@automattic/i18n-utils';
import { getDifmOfferCopy, useDifmOffer } from 'calypso/dashboard/utils/difm-offer';
import { useSelector } from 'calypso/state';
import isSiteA4ADevSite from 'calypso/state/selectors/is-site-a4a-dev-site';
import { getSiteOption } from 'calypso/state/sites/selectors';
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { DifmOfferCopy, DifmOfferVariation } from 'calypso/dashboard/utils/difm-offer';

interface MyHomeDifmOffer {
	copy: DifmOfferCopy | null;
	variation: DifmOfferVariation;
}

/**
 * Resolves the DIFM offer for the selected site. `copy` is null when the card must not render.
 * The older "Build it for me" task card also reads this, so that both cards never show together.
 */
export default function useMyHomeDifmOffer(): MyHomeDifmOffer {
	const siteId = useSelector( getSelectedSiteId );
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ) ?? undefined;
	const siteCreatedAt = useSelector( ( state ) => getSiteOption( state, siteId, 'created_at' ) ) as
		string | undefined;
	const isA4ADevSite = useSelector( ( state ) => isSiteA4ADevSite( state, siteId ) );
	const localeSlug = useLocale();

	const { isEligible, isLoading, variation } = useDifmOffer( {
		planSlug,
		siteCreatedAt,
		localeSlug,
		isA4ADevSite,
	} );

	if ( ! isEligible || isLoading ) {
		return { copy: null, variation };
	}

	return { copy: getDifmOfferCopy( variation ), variation };
}
