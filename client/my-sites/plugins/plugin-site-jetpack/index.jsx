import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import {
	getPluginOnSite,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';

import './style.scss';

const PluginSiteJetpack = ( props ) => {
	const translate = useTranslate();
	const installInProgress = useSelector( ( state ) =>
		isPluginActionInProgress( state, props.site.ID, props.plugin.id, INSTALL_PLUGIN )
	);
	const pluginOnSite = useSelector( ( state ) =>
		getPluginOnSite( state, props.site.ID, props.plugin.slug )
	);
	const [ isMobileLayout, setIsMobileLayout ] = useState();

	useEffect( () => {
		if ( isWithinBreakpoint( '<1040px' ) ) {
			setIsMobileLayout( true );
		}
		const unsubscribe = subscribeIsWithinBreakpoint( '<1040px', ( isMobile ) =>
			setIsMobileLayout( isMobile )
		);

		return () => {
			if ( typeof unsubscribe === 'function' ) {
				unsubscribe();
			}
		};
	}, [] );

	if ( ! props.site || ! props.plugin ) {
		return null;
	}

	if ( ! pluginOnSite ) {
		return (
			<div className="plugin-site-jetpack__container">
				<div className="plugin-site-jetpack__domain">{ props.site.domain }</div>
				<div className="plugin-site-jetpack__install-button">
					{
						<PluginInstallButton
							isEmbed={ true }
							selectedSite={ props.site }
							plugin={ props.plugin }
							isInstalling={ installInProgress }
						/>
					}
				</div>
			</div>
		);
	}

	const {
		activation: canToggleActivation = true,
		autoupdate: canToggleAutoupdate = true,
		remove: canToggleRemove = true,
	} = props?.allowedActions;

	const { isAutoManaged = false } = props;
	const settingsLink = pluginOnSite?.action_links?.Settings ?? null;

	return (
		<div className="plugin-site-jetpack__container">
			<div className="plugin-site-jetpack__domain">{ props.site.domain }</div>
			{ canToggleActivation && (
				<PluginActivateToggle site={ props.site } plugin={ pluginOnSite } />
			) }
			{ canToggleAutoupdate && (
				<PluginAutoupdateToggle site={ props.site } plugin={ pluginOnSite } wporg={ true } />
			) }
			{ isAutoManaged ? (
				<div className="plugin-site-jetpack__automanage-notice">
					{ translate( 'Auto-managed on this site' ) }
				</div>
			) : (
				<div className="plugin-site-jetpack__action plugin-action last-actions">
					{ ! isMobileLayout && canToggleRemove && (
						<PluginRemoveButton plugin={ pluginOnSite } site={ props.site } />
					) }
					{ ( isMobileLayout || settingsLink ) && (
						<EllipsisMenu position={ 'bottom' }>
							{ settingsLink && (
								<PopoverMenuItem href={ settingsLink }>{ translate( 'Settings' ) }</PopoverMenuItem>
							) }
							{ isMobileLayout && (
								<PluginRemoveButton plugin={ pluginOnSite } site={ props.site } menuItem />
							) }
						</EllipsisMenu>
					) }
				</div>
			) }
		</div>
	);
};

PluginSiteJetpack.propTypes = {
	site: PropTypes.object,
	plugin: PropTypes.object,
	allowedActions: PropTypes.shape( {
		activation: PropTypes.bool,
		autoupdate: PropTypes.bool,
		remove: PropTypes.bool,
	} ),
	isAutoManaged: PropTypes.bool,
};

PluginSiteJetpack.defaultProps = {
	allowedActions: {
		activation: true,
		autoupdate: true,
		remove: true,
	},
	isAutoManaged: false,
};

export default PluginSiteJetpack;
