import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ButtonGroup from 'calypso/components/button-group';
import acceptDialog from 'calypso/lib/accept';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { updatePlugin } from 'calypso/state/plugins/installed/actions';
import { getPlugins, getPluginsOnSites } from 'calypso/state/plugins/installed/selectors';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import getSites from 'calypso/state/selectors/get-sites';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	getPluginActionDailogMessage,
	handleUpdatePlugins,
	siteObjectsToSiteIds,
} from '../../utils';
import type { PluginComponentProps } from '../types';
import type { ReactElement } from 'react';

import '../style.scss';

interface Props {
	plugins: Array< PluginComponentProps >;
	isWpCom?: boolean;
}

export default function UpdatePlugins( { plugins, isWpCom }: Props ): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = useSelector( () => siteObjectsToSiteIds( sites ) ) ?? [];
	const pluginsWithUpdates = useSelector( ( state ) =>
		// The types of the getPlugins properties are being inferred incorrectly, so here they are casted
		// to "any" while the return type is preserved.
		( getPlugins as ( ...any: any ) => ReturnType< typeof getPlugins > )(
			state,
			siteIds,
			'updates'
		)
	);
	const allSites = useSelector( getSites );

	const pluginsOnSites = useSelector( ( state ) => getPluginsOnSites( state, plugins ) );
	const selectedSite = useSelector( getSelectedSite );

	const pluginUpdateCount = pluginsWithUpdates.length;

	const updateAction = ( siteId: number, sitePlugin: PluginComponentProps ) => {
		dispatch( updatePlugin( siteId, sitePlugin ) );
	};

	function recordEvent( eventAction: string ) {
		eventAction += selectedSite ? '' : ' on Multisite';
		const pluginSlugs = pluginsWithUpdates.map( ( plugin: PluginComponentProps ) => plugin.slug );
		dispatch( recordGoogleEvent( 'Plugins', eventAction, 'Plugins', pluginSlugs ) );
	}

	function updateAllPlugins( accepted: boolean ) {
		if ( accepted ) {
			handleUpdatePlugins( plugins, updateAction, pluginsOnSites );
			recordEvent( 'Clicked Update all Plugins' );
			recordTracksEvent( 'calypso_plugins_update_all_click' );
			dispatch( removePluginStatuses( 'completed', 'error', 'up-to-date' ) );
		}
	}

	function updateAllPluginsNotice() {
		let heading = translate( 'Update %(pluginUpdateCount)d plugins', {
			args: { pluginUpdateCount },
		} );

		if ( pluginUpdateCount === 1 ) {
			const [ { name, slug } ] = pluginsWithUpdates;
			heading = translate( 'Update %(pluginName)s', { args: { pluginName: name || slug } } );
		}

		const dialogOptions = {
			additionalClassNames: 'plugins__confirmation-modal',
		};

		acceptDialog(
			getPluginActionDailogMessage( allSites, pluginsWithUpdates, heading, 'update' ),
			( accepted: boolean ) => updateAllPlugins( accepted ),
			heading,
			null,
			dialogOptions
		);
	}

	const buttonContent = (
		<Button primary compact={ ! isWpCom } onClick={ updateAllPluginsNotice }>
			{ translate( 'Update %(numUpdates)d Plugin', 'Update %(numUpdates)d Plugins', {
				context: 'button label',
				count: pluginUpdateCount,
				args: {
					numUpdates: pluginUpdateCount,
				},
			} ) }
		</Button>
	);

	if ( ! pluginUpdateCount ) {
		return null;
	}

	return isWpCom ? (
		buttonContent
	) : (
		<ButtonGroup className="plugin-management-v2__table-button-group">
			{ buttonContent }
		</ButtonGroup>
	);
}
