import { Icon, arrowRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getPluginOnSites } from 'calypso/state/plugins/installed/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	plugin: Plugin;
	selectedSite?: SiteDetails;
	className?: string;
}

export default function UpdatePlugin( {
	plugin,
	selectedSite,
	className,
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
		const sitePlugin = pluginsOnSites?.sites[ site.ID ];
		return sitePlugin?.update && site.canUpdateFiles;
	} );

	const allowedActions = getAllowedPluginActions( plugin, state, selectedSite );

	let content;

	if ( ! allowedActions?.autoupdate ) {
		content = <div>{ translate( 'Auto-managed on this site' ) }</div>;
	} else if ( hasUpdate ) {
		content = (
			<div className="update-plugin__plugin-update-wrapper">
				<span className="update-plugin__current-version">{ plugin?.version }</span>
				<span className="update-plugin__arrow-icon">
					<Icon size={ 24 } icon={ arrowRight } />
				</span>
				<span className="update-plugin__new-version">
					<a href={ `/plugins/${ plugin.slug }` }>
						{ translate( '{{span}}Update to {{/span}} %s', {
							components: {
								span: <span />,
							},
							args: updated_versions[ 0 ],
						} ) }
					</a>
				</span>
			</div>
		);
	}
	return content ? <div className={ classNames( className ) }>{ content }</div> : null;
}
