import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import SitesList from '../sites-list';
import type { Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	sites: Array< SiteData | null | undefined >;
	selectedSite: SiteData;
	isLoading: boolean;
	plugin: Plugin;
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

	const siteCount = sitesWithSecondarySites.length;

	return (
		<>
			<div className="plugin-details-v2__title">
				{ translate(
					'Installed on %(count)d site',
					'Installed on %(count)d sites', // plural version of the string
					{
						count: siteCount,
						args: { count: siteCount },
					}
				) }
			</div>
			<SitesList
				{ ...props }
				items={ sitesWithSecondarySites.map( ( site ) => site.site ) }
				columns={ columns }
			/>
		</>
	);
}
