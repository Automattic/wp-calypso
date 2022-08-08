import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import PluginsTable from './plugins-table';
import type { Plugin } from './types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

import './style.scss';

interface Props {
	plugins: Array< Plugin >;
	isLoading: boolean;
	selectedSite: SiteData;
	searchTerm: string;
}
export default function PluginManagementV2( {
	plugins,
	isLoading,
	selectedSite,
	searchTerm,
}: Props ): ReactElement {
	const translate = useTranslate();
	const columns = [
		{
			key: 'plugin',
			title: translate( 'Installed Plugins' ),
		},
		{
			key: 'sites',
			title: translate( 'Sites' ),
			smallColumn: true,
			colSpan: 2,
		},
	];

	if ( ! plugins.length && ! isLoading ) {
		let emptyStateMessage = translate( 'No plugins found' );
		if ( searchTerm ) {
			emptyStateMessage = translate( 'No results found. Please try refining your search.' );
		}
		return <div className="plugin-management-v2__no-sites">{ emptyStateMessage }</div>;
	}

	return (
		<div className="plugin-management-v2__main-content-container">
			<PluginsTable
				items={ plugins }
				columns={ columns }
				isLoading={ isLoading }
				selectedSite={ selectedSite }
			/>
		</div>
	);
}
