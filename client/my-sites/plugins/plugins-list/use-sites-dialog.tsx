import { useCallback, useState } from 'react';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { ManageSitePluginsDialog } from '../manage-site-plugins-dialog';

export function useSitesDialog() {
	const [ displayManageSitePluginsModal, setDisplayManageSitePluginsModal ] = useState( false );
	const [ plugin, setPlugin ] = useState< Plugin | null >( null );

	const toggleDialogForPlugin = useCallback( ( plugin: Plugin | null = null ) => {
		setPlugin( plugin );
		setDisplayManageSitePluginsModal( ( value ) => ! value );
	}, [] );

	const sitesDialog = plugin ? (
		<ManageSitePluginsDialog
			plugin={ plugin }
			isVisible={ displayManageSitePluginsModal }
			onClose={ () => setDisplayManageSitePluginsModal( false ) }
		/>
	) : null;

	return { sitesDialog, toggleDialogForPlugin };
}
