import { Button } from '@automattic/components';
import { Icon, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { UPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { useSelector } from 'calypso/state';
import { getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import PluginActionStatus from '../plugin-action-status';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import { getPluginActionStatuses } from '../utils/get-plugin-action-statuses';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	plugin: PluginComponentProps;
	selectedSite?: SiteDetails;
	className?: string;
	updatePlugin?: ( plugin: PluginComponentProps ) => void;
}

export default function UpdatePlugin( { plugin, selectedSite, className, updatePlugin }: Props ) {
	const translate = useTranslate();
	const allSites = useSelector( getSites );
	const state = useSelector( ( state ) => state );

	const getPluginSites = ( plugin: PluginComponentProps ) => {
		return Object.keys( plugin.sites ).map( ( siteId ) => {
			const site = allSites.find( ( s ) => s?.ID === parseInt( siteId ) );
			return {
				...site,
				...plugin.sites[ siteId ],
			} as any; // This must be cast as any until this file is updated to work with the selectors in state/plugins/installed/selectors
		} );
	};

	const sites = getPluginSites( plugin );
	const siteIds = siteObjectsToSiteIds( sites );
	const pluginsOnSites: any = getPluginOnSites( state, siteIds, plugin?.slug );

	const currentVersions = sites
		.map( ( site ) => {
			const siteId = selectedSite ? selectedSite.ID : site.ID;
			const sitePlugin = pluginsOnSites?.sites[ siteId ];
			return sitePlugin?.version;
		} )
		.filter( ( version ) => version );

	const updatedVersions = sites
		.map( ( site ) => {
			const siteId = selectedSite ? selectedSite.ID : site.ID;
			const sitePlugin = pluginsOnSites?.sites[ siteId ];
			return sitePlugin?.update?.new_version;
		} )
		.filter( ( version ) => version );

	const currentVersionsRange = useMemo( () => {
		const versions = [
			// We want to remove the duplicated versions in the array, because if multiple sites have
			// the same plugin version, we don't want to display the range.
			...new Set(
				// Sort the plugin versions, respecting semantic version convention.
				currentVersions.sort( ( a: string, b: string ): number =>
					a.localeCompare( b, undefined, {
						numeric: true,
						sensitivity: 'case',
						caseFirst: 'upper',
					} )
				)
			),
		];

		return {
			min: versions[ 0 ],
			max: versions.length > 1 ? versions[ versions.length - 1 ] : null,
		};
	}, [ currentVersions ] );

	const hasUpdate = sites.some( ( site ) => {
		const siteId = selectedSite ? selectedSite.ID : site.ID;
		const sitePlugin = pluginsOnSites?.sites[ siteId ];
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
				<span className="update-plugin__current-version">
					{ currentVersionsRange?.min }
					{ currentVersionsRange?.max && ` - ${ currentVersionsRange.max }` }
				</span>
				<span className="update-plugin__arrow-icon">
					<Icon size={ 24 } icon={ arrowRight } />
				</span>
				<Button
					primary
					onClick={ () => updatePlugin && updatePlugin( plugin ) }
					className="update-plugin__new-version"
					borderless
					compact
				>
					{ translate( '{{span}}Update to {{/span}}%s', {
						components: {
							span: <span />,
						},
						args: updatedVersions[ 0 ],
					} ) }
				</Button>
			</div>
		);
	}
	return content ? <div className={ classNames( className ) }>{ content }</div> : null;
}
