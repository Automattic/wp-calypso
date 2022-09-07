import { Button } from '@automattic/components';
import { Icon, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { UPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import PluginActionStatus from '../plugin-action-status';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import { getPluginActionStatuses } from '../utils/get-plugin-action-statuses';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	plugin: Plugin;
	selectedSite?: SiteDetails;
	className?: string;
	updatePlugin?: ( plugin: Plugin ) => void;
}

export default function UpdatePlugin( {
	plugin,
	selectedSite,
	className,
	updatePlugin,
}: Props ): ReactElement | null {
	const translate = useTranslate();
	const allSites = useSelector( getSites );
	const state = useSelector( ( state ) => state );

	const getPluginSites = ( plugin: Plugin ) => {
		return Object.keys( plugin.sites ).map( ( siteId ) => {
			const site = allSites.find( ( s ) => s?.ID === parseInt( siteId ) );
			return {
				...site,
				...plugin.sites[ siteId ],
			};
		} );
	};

	const sites = getPluginSites( plugin );
	const siteIds = siteObjectsToSiteIds( sites );
	const pluginsOnSites: any = getPluginOnSites( state, siteIds, plugin?.slug );

	const updated_versions = sites
		.map( ( site ) => {
			const sitePlugin = pluginsOnSites?.sites[ site.ID ];
			return sitePlugin?.update?.new_version;
		} )
		.filter( ( version ) => version );

	const hasUpdate = sites.some( ( site ) => {
		const sitePlugin = pluginsOnSites?.sites[ selectedSite ? selectedSite.ID : site.ID ];
		return sitePlugin?.update?.new_version && site.canUpdateFiles;
	} );

	const allowedActions = getAllowedPluginActions( plugin, state, selectedSite );

	let content;

	const allStatuses = getPluginActionStatuses( state );

	const updateStatuses = allStatuses.filter(
		( status ) =>
			status.pluginId === plugin.id &&
			status.action === UPDATE_PLUGIN &&
			// Filter out status based on selected site if any
			( selectedSite ? parseInt( status.siteId ) === selectedSite.ID : true )
	);

	if ( ! allowedActions?.autoupdate ) {
		content = <div>{ translate( 'Auto-managed on this site' ) }</div>;
	} else if ( updateStatuses.length > 0 ) {
		content = (
			<>
				<div className="update-plugin__plugin-action-status">
					<PluginActionStatus
						showMultipleStatuses={ false }
						currentSiteStatuses={ updateStatuses }
						selectedSite={ selectedSite }
						retryButton={
							<Button
								onClick={ () => updatePlugin && updatePlugin( plugin ) }
								className="update-plugin__retry-button"
								borderless
								compact
							>
								{ translate( 'Retry' ) }
							</Button>
						}
					/>
				</div>
			</>
		);
	} else if ( hasUpdate ) {
		content = (
			<div className="update-plugin__plugin-update-wrapper">
				<span className="update-plugin__current-version">{ plugin?.version }</span>
				<span className="update-plugin__arrow-icon">
					<Icon size={ 24 } icon={ arrowRight } />
				</span>
				<Button
					onClick={ () => updatePlugin && updatePlugin( plugin ) }
					className="update-plugin__new-version"
					borderless
					compact
				>
					{ translate( '{{span}}Update to {{/span}} %s', {
						components: {
							span: <span />,
						},
						args: updated_versions[ 0 ],
					} ) }
				</Button>
			</div>
		);
	}
	return content ? <div className={ classNames( className ) }>{ content }</div> : null;
}
