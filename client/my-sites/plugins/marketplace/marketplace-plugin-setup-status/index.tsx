/**
 * External dependencies
 */
import React from 'react';
import { ThemeProvider } from 'emotion-theming';
import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';

/**
 * Style dependencies
 */
import 'calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status/style.scss';

const StyledProgressBar = styled( ProgressBar )`
	margin: 20px 0px;
`;

function WrappedMarketplacePluginSetup( {
	pluginSlug = 'wordpress-seo',
}: {
	pluginSlug?: string;
} ): JSX.Element {
	const selectedSite = useSelector( getSelectedSite );

	//Plugin status can be extracted with this selector once installation is triggered
	const pluginStatus = useSelector( ( state ) => {
		return selectedSite ? getStatusForPlugin( state, selectedSite?.ID, pluginSlug ) : 'UNKNOWN';
	} );

	return (
		<>
			{ selectedSite?.ID ? <QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<h1 className="marketplace-plugin-setup-status__title wp-brand-font">
						Installing Plugin { pluginStatus }
					</h1>
					<StyledProgressBar value={ 25 } color={ '#C9356E' } compact />
					<div>Step 1 of 3</div>
				</div>
			</div>
		</>
	);
}

export default function MarketplacePluginSetup(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<WrappedMarketplacePluginSetup />
		</ThemeProvider>
	);
}
