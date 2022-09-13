import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { MOST_POPULAR_BUNDLES } from '../../constants';
import { getPlansToDisplay } from '../../product-grid/utils';
import { ItemToDisplayProps } from '../types';
import { isolatePopularItems } from '../utils/isolate-popular-items';

export const useBundlesToDisplay = ( { siteId, duration }: ItemToDisplayProps ) => {
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );

	const currentPlanSlug = currentPlan?.product_slug || null;

	return useMemo( () => {
		const allItems = getPlansToDisplay( { duration, currentPlanSlug } );

		return isolatePopularItems( allItems, MOST_POPULAR_BUNDLES );
	}, [ duration, currentPlanSlug ] );
};
