import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import PluginCard from './plugin-card';
import PluginsTable from './plugins-table';
import type { Plugin } from './types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement } from 'react';

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
			<div className="plugin-management-v2__mobile-view">
				<>
					<Card className="plugin-management-v2__content-header">
						<div>{ translate( 'Installed Plugins' ) }</div>
					</Card>
					{ isLoading ? (
						<Card>
							<TextPlaceholder />
						</Card>
					) : (
						plugins.map( ( item ) => (
							<PluginCard key={ item.id } item={ item } selectedSite={ selectedSite } />
						) )
					) }
				</>
			</div>
		</div>
	);
}
