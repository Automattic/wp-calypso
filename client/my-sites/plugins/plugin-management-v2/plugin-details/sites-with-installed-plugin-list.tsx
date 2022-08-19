import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import PluginsList from '../plugins-list';
import type { PluginRowFormatterArgs } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	sites: Array< SiteData | null | undefined >;
	selectedSite: SiteData;
	isLoading: boolean;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
}

export default function SitesWithInstalledPluginsList( props: Props ): ReactElement | null {
	const translate = useTranslate();
	const columns = [
		{
			key: 'site-name',
			title: translate( 'Site' ),
		},
		{
			key: 'activate',
			title: translate( 'Active' ),
			smallColumn: true,
		},
		{
			key: 'autoupdate',
			title: translate( 'Autoupdate' ),
			smallColumn: true,
			colSpan: 2,
		},
		{
			key: 'update',
		},
	];

	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, props.sites )
	);

	if ( ! sitesWithSecondarySites?.length ) {
		return null;
	}

	return (
		<>
			<div className="plugin-details__title">
				{ translate( 'Installed on %(count)d sites', {
					args: {
						count: sitesWithSecondarySites.length,
					},
				} ) }
			</div>
			<PluginsList
				{ ...props }
				items={ sitesWithSecondarySites.map( ( site ) => site.site ) }
				columns={ columns }
				primaryKey="ID"
			/>
		</>
	);
}
