import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PluginCommonList from '../plugin-common/plugin-common-list';
import PluginManageConnection from '../plugin-manage-connection';
import PluginRowFormatter from '../plugin-row-formatter';
import RemovePlugin from '../remove-plugin';
import type { Columns, PluginRowFormatterArgs, PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import '../style.scss';

interface Props {
	selectedSite?: SiteDetails;
	items: Array< PluginComponentProps >;
	isLoading: boolean;
	columns: Columns;
	className?: string;
	removePluginNotice: ( plugin: PluginComponentProps ) => void;
	updatePlugin: ( plugin: PluginComponentProps ) => void;
}

export default function PluginsList( {
	selectedSite,
	removePluginNotice,
	updatePlugin,
	...rest
}: Props ) {
	const translate = useTranslate();

	const rowFormatter = ( props: PluginRowFormatterArgs ) => {
		return (
			<PluginRowFormatter
				{ ...props }
				selectedSite={ selectedSite }
				updatePlugin={ updatePlugin }
			/>
		);
	};

	const trackManagePlugin = ( pluginSlug: string ) => () => {
		recordTracksEvent( 'calypso_plugin_manage_click', {
			site: selectedSite?.ID,
			plugin: pluginSlug,
		} );
	};

	const trackRemovePlugin = ( pluginSlug: string ) => {
		recordTracksEvent( 'calypso_plugin_remove_click', {
			plugin: pluginSlug,
		} );
	};

	const onRemoveClick = ( plugin: PluginComponentProps ) => () => {
		removePluginNotice( plugin );
		trackRemovePlugin( plugin.slug );
	};

	const renderActions = ( plugin: PluginComponentProps ) => {
		return (
			<>
				<PopoverMenuItem
					className="plugin-management-v2__actions"
					icon="chevron-right"
					href={ `/plugins/${ plugin.slug }${ selectedSite ? `/${ selectedSite.domain }` : '' }` }
					onClick={ trackManagePlugin( plugin.slug ) }
				>
					{ translate( 'Manage plugin' ) }
				</PopoverMenuItem>
				{ selectedSite ? (
					<RemovePlugin site={ selectedSite } plugin={ plugin } />
				) : (
					<PopoverMenuItem
						icon="trash"
						className="plugin-management-v2__actions"
						onClick={ onRemoveClick( plugin ) }
					>
						{ translate( 'Remove' ) }
					</PopoverMenuItem>
				) }
				{ selectedSite && <PluginManageConnection site={ selectedSite } plugin={ plugin } /> }
			</>
		);
	};

	return (
		<PluginCommonList
			{ ...rest }
			selectedSite={ selectedSite }
			rowFormatter={ rowFormatter }
			primaryKey="id"
			renderActions={ renderActions }
		/>
	);
}
