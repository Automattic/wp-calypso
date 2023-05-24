import { useSelector } from 'calypso/state';
import { getPlanPrices } from 'calypso/state/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PlanPrices } from 'calypso/state/plans/selectors/get-plan-prices';
import type { IAppState } from 'calypso/state/types';
interface Props {
	planSlug: PlanSlug;
	returnMonthly: boolean; // defaults to true
}

const usePlanPrices = ( { planSlug, returnMonthly }: Props ): PlanPrices => {
	return useSelector( ( state: IAppState ) => {
		const siteId = getSelectedSiteId( state ) ?? null;
		return getPlanPrices( state, { planSlug, siteId, returnMonthly } );
	} );
};

export default usePlanPrices;
