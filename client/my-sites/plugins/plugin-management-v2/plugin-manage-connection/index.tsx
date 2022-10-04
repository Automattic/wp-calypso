import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getManageConnectionHref } from 'calypso/lib/plugins/utils';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: Plugin;
}

export default function PluginManageConnection( { site, plugin }: Props ) {
	const translate = useTranslate();

	const isJetpackPlugin = plugin && 'jetpack' === plugin.slug;

	const trackManageConnection = () => {
		recordTracksEvent( 'calypso_plugin_manage_connection_click', {
			site: site.ID,
			plugin: plugin.slug,
		} );
	};

	return isJetpackPlugin ? (
		<PopoverMenuItem
			className="plugin-management-v2__actions"
			icon="cog"
			href={ getManageConnectionHref( site.slug ) }
			onClick={ trackManageConnection }
		>
			{ translate( 'Manage Connection', {
				comment: 'manage Jetpack connnection settings link',
			} ) }
		</PopoverMenuItem>
	) : null;
}
