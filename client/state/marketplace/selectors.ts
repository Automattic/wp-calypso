import { isBusiness, isEcommerce, isEnterprise } from '@automattic/calypso-products';
import { default as isVipSite } from 'calypso/state/selectors/is-vip-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';

const shouldUpgradeCheck = (
	state: IAppState,
	selectedSite: { ID: number; plan: WithSnakeCaseSlug | WithCamelCaseSlug }
) => {
	return selectedSite
		? ! (
				isBusiness( selectedSite?.plan ) ||
				isEnterprise( selectedSite?.plan ) ||
				isEcommerce( selectedSite?.plan ) ||
				isJetpackSite( state, selectedSite?.ID ) ||
				isVipSite( state, selectedSite?.ID )
		  )
		: null;
};

export default shouldUpgradeCheck;
