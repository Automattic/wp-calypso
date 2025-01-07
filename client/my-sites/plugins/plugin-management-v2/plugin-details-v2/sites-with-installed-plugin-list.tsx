import { useTranslate } from 'i18n-calypso';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import { useSelector } from 'calypso/state';
import PluginManageConnection from '../plugin-manage-connection';
import PluginManageSubcription from '../plugin-manage-subscription';
import RemovePlugin from '../remove-plugin';
import SitesList from '../sites-list';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	sites: Array< SiteDetails | null | undefined >;
	selectedSite?: SiteDetails;
	isLoading: boolean;
	plugin: PluginComponentProps;
	isWpCom?: boolean;
}

export default function SitesWithInstalledPluginsList( {
	sites,
	plugin,
	selectedSite,
	isWpCom,
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
		const settingsLink = plugin?.action_links?.Settings ?? null;
		return (
			<>
				<RemovePlugin site={ site } plugin={ plugin } />
				<PluginManageConnection site={ site } plugin={ plugin } />
				{ isWpCom && (
					<>
						<PluginManageSubcription site={ site } plugin={ plugin } />
						{ settingsLink && (
							<PopoverMenuItem
								className="plugin-management-v2__actions"
								icon="cog"
								href={ settingsLink }
							>
								{ translate( 'Settings' ) }
							</PopoverMenuItem>
						) }
					</>
				) }
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
			{ isWpCom && plugin.isMarketplaceProduct && <QueryUserPurchases /> }
			<SitesList
				{ ...rest }
				plugin={ plugin }
				selectedSite={ selectedSite }
				items={ sitesWithSecondarySites
					.map( ( site ) => site.site )
					.filter( ( site ) => site && ! site.is_deleted ) }
				columns={ columns }
				renderActions={ renderActions }
			/>
		</>
	);
}
