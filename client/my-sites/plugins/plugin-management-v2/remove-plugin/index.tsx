import { useSelector } from 'calypso/state';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import PluginRemoveButton from '../../plugin-remove-button';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: PluginComponentProps;
}

export default function RemovePlugin( { site, plugin }: Props ) {
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, site.ID, plugin.slug ) );

	return (
		<PluginRemoveButton
			key={ `remove-plugin-${ site.ID }` }
			plugin={ pluginOnSite }
			site={ site }
			menuItem
			isJetpackCloud
			isMarketplaceProduct={ plugin.isMarketplaceProduct }
			classNames="plugin-management-v2__actions"
		/>
	);
}
