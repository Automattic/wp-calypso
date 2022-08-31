import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getManageConnectionHref } from 'calypso/lib/plugins/utils';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: Plugin;
}

export default function PluginManageConnection( { site, plugin }: Props ): ReactElement | null {
	const translate = useTranslate();

	const isJetpackPlugin = plugin && 'jetpack' === plugin.slug;

	return isJetpackPlugin ? (
		<PopoverMenuItem
			className="plugin-management-v2__actions"
			icon="cog"
			href={ getManageConnectionHref( site.slug ) }
		>
			{ translate( 'Manage Connection', {
				comment: 'manage Jetpack connnection settings link',
			} ) }
		</PopoverMenuItem>
	) : null;
}
