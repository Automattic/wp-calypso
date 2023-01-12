import PluginRemoveButton from '../../plugin-remove-button';
import type { SiteDetails } from '@automattic/data-stores';
import type { Plugin } from 'calypso/state/plugins/installed/types';

import '../style.scss';

interface Props {
	site: SiteDetails;
	plugin: Plugin;
}

export default function RemovePlugin( { site, plugin }: Props ) {
	return (
		<PluginRemoveButton
			key={ `remove-plugin-${ site.ID }` }
			plugin={ plugin }
			site={ site }
			menuItem
			isJetpackCloud
			isMarketplaceProduct={ plugin.isMarketplaceProduct }
			classNames="plugin-management-v2__actions"
		/>
	);
}
