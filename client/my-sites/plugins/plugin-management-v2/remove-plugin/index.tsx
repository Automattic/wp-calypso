import { useSelector } from 'react-redux';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import PluginRemoveButton from '../../plugin-remove-button';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	site: SiteDetails;
	plugin: Plugin;
}

export default function RemovePlugin( { site, plugin }: Props ): ReactElement {
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, site.ID, plugin.slug ) );

	return (
		<PluginRemoveButton
			key={ `remove-plugin-${ site.ID }` }
			plugin={ pluginOnSite }
			site={ site }
			menuItem
			isJetpackCloud
			isMarketplaceProduct={ plugin.isMarketplaceProduct }
			classNames="installed-site-actions__remove-button"
		/>
	);
}
