// @ts-nocheck - TODO: Fix TypeScript issues
import { SiteDetails } from '@automattic/data-stores';
import ThemeQueryManager from 'calypso/lib/query-manager/theme';
import productsListReducer from 'calypso/state/products-list/reducer';
import purchasesReducer from 'calypso/state/purchases/reducer';
import themeReducer from 'calypso/state/themes/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ThemeTierBadge from '../../index';
import { themes } from './fixtures';

type ReduxSettings = {
	siteDetails?: Partial< SiteDetails >;
	siteFeatures?: string[];
	themeRepository?: 'wpcom' | 'wporg';
};

export const render = (
	element: React.ReactElement< React.ComponentProps< typeof ThemeTierBadge > >,
	{ siteDetails = {}, siteFeatures = [], themeRepository = 'wpcom' }: ReduxSettings = {}
) => {
	return renderWithProvider( element, {
		initialState: {
			sites: {
				items: { [ element.props.siteId ]: siteDetails },
				features: { [ element.props.siteId ]: { data: { active: siteFeatures } } },
			},
			themes: {
				queries: {
					[ themeRepository ]: new ThemeQueryManager(
						{
							items: {
								[ element.props.themeId ]: themes[ element.props.themeId ],
							},
						},
						{ itemKey: 'id' }
					),
				},
			},
		},
		reducers: {
			themes: themeReducer,
			productsList: productsListReducer,
			purchases: purchasesReducer,
		},
	} );
};
