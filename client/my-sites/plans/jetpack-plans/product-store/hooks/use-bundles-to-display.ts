import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { MOST_POPULAR_BUNDLES } from '../../constants';
import { getPlansToDisplay } from '../../product-grid/utils';
import { ItemToDisplayProps } from '../types';
import { isolatePopularItems } from '../utils/isolate-popular-items';

export const useBundlesToDisplay = ( { siteId, duration }: ItemToDisplayProps ) => {
	const translate = useTranslate();
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );

	const currentPlanSlug = currentPlan?.product_slug || null;

	return useMemo( () => {
		const allItems = getPlansToDisplay( { duration, currentPlanSlug } );

		return isolatePopularItems( allItems, MOST_POPULAR_BUNDLES );

		// The plans object returned by `getPlansToDisplay` is using translate calls internally,
		// which in this case requires adding `translate` to the memoization dependancies list,
		// so that the object gets recomputed with the updated strings from the `translate` calls
		// when i18n data changes (i.e. after async translations are being loaded).
		//
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ duration, currentPlanSlug, translate ] );
};
