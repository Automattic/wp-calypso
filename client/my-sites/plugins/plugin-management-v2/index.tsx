import { useTranslate } from 'i18n-calypso';
import PluginsList from './plugins-list';
import type { Plugin } from './types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	plugins: Array< Plugin >;
	isLoading: boolean;
	selectedSite: SiteDetails;
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
		...( selectedSite
			? [
					{
						key: 'activate',
						title: translate( 'Active' ),
						smallColumn: true,
					},
					{
						key: 'autoupdate',
						title: translate( 'Autoupdate' ),
						smallColumn: true,
					},
					{
						key: 'last-updated',
						title: translate( 'Last updated' ),
						smallColumn: true,
						colSpan: 2,
					},
			  ]
			: [
					{
						key: 'sites',
						title: translate( 'Sites' ),
						smallColumn: true,
						colSpan: 2,
					},
			  ] ),
		{
			key: 'update',
		},
	];

	if ( ! plugins.length && ! isLoading ) {
		let emptyStateMessage = translate( 'No plugins found' );
		if ( searchTerm ) {
			emptyStateMessage = translate( 'No results found. Please try refining your search.' );
		}
		return <div className="plugin-management-v2__no-sites">{ emptyStateMessage }</div>;
	}

	const title = translate( 'Installed Plugins' );

	return (
		<div className="plugin-management-v2__main-content-container">
			<PluginsList
				items={ plugins }
				columns={ columns }
				isLoading={ isLoading }
				selectedSite={ selectedSite }
				title={ title }
			/>
		</div>
	);
}
