import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import PluginManageConnection from '../plugin-manage-connection';
import RemovePlugin from '../remove-plugin';
import SitesList from '../sites-list';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	sites: Array< SiteDetails | null | undefined >;
	selectedSite: SiteDetails;
	isLoading: boolean;
	plugin: Plugin;
}

export default function SitesWithInstalledPluginsList( {
	sites,
	plugin,
	selectedSite,
	...rest
}: Props ) {
	const translate = useTranslate();
	const columns = [
		{
			key: 'site-name',
			header: translate( 'Site' ),
		},
		{
			key: 'activate',
			header: translate( 'Active' ),
			smallColumn: true,
		},
		{
			key: 'autoupdate',
			header: translate( 'Autoupdate' ),
			smallColumn: true,
			colSpan: 4,
		},
		{
			key: 'update',
		},
	];

	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, sites )
	);

	if ( ! sitesWithSecondarySites?.length ) {
		return null;
	}

	const siteCount = sitesWithSecondarySites.length;

	const renderActions = ( site: SiteDetails ) => {
		return (
			<>
				<RemovePlugin site={ site } plugin={ plugin } />
				<PluginManageConnection site={ site } plugin={ plugin } />
			</>
		);
	};

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
				{ ...rest }
				plugin={ plugin }
				selectedSite={ selectedSite }
				items={ sitesWithSecondarySites.map( ( site ) => site.site ) }
				columns={ columns }
				renderActions={ renderActions }
			/>
		</>
	);
}
