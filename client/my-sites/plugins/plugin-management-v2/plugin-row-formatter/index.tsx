import { Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import UpdatePlugin from 'calypso/my-sites/plugins/plugin-management-v2/update-plugin';
import {
	isPluginActionInProgress,
	getPluginOnSite,
} from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { MomentInput } from 'moment';
import type { ReactElement, ReactChild } from 'react';

import './style.scss';

interface Props {
	item: Plugin;
	columnKey: string;
	selectedSite?: SiteDetails;
	isSmallScreen?: boolean;
	className?: string;
}

export default function PluginRowFormatter( {
	item,
	columnKey,
	selectedSite,
	isSmallScreen,
	className,
}: Props ): ReactElement | any {
	const translate = useTranslate();

	const PluginDetailsButton = ( props: { className: string; children: ReactChild } ) => {
		return (
			<Button
				borderless
				compact
				href={ `/plugins/${ item.slug }${ selectedSite ? `/${ selectedSite.domain }` : '' }` }
				{ ...props }
			/>
		);
	};

	const moment = useLocalizedMoment();
	const state = useSelector( ( state ) => state );

	const ago = ( date: MomentInput ) => {
		return moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	};

	let canActivate;
	let canUpdate;

	const installInProgress = useSelector(
		( state ) =>
			selectedSite && isPluginActionInProgress( state, selectedSite.ID, item.id, INSTALL_PLUGIN )
	);

	if ( selectedSite ) {
		const { activation, autoupdate } = getAllowedPluginActions( item, state, selectedSite );
		canActivate = activation;
		canUpdate = autoupdate;
	}

	const pluginOnSite = useSelector(
		( state ) => selectedSite && getPluginOnSite( state, selectedSite.ID, item.slug )
	);

	const siteCount = item?.sites && Object.keys( item.sites ).length;

	switch ( columnKey ) {
		case 'site-name':
			return (
				<span className="plugin-row-formatter__row-container">
					<span className="plugin-row-formatter__site-name">{ selectedSite?.domain }</span>
					{ /* Overlay for small screen is added in the card component */ }
					{ ! isSmallScreen && <span className="plugin-row-formatter__overlay"></span> }
				</span>
			);
		case 'plugin':
			return isSmallScreen ? (
				<PluginDetailsButton className="plugin-row-formatter__plugin-name-card">
					{ item.name }
				</PluginDetailsButton>
			) : (
				<span className="plugin-row-formatter__row-container">
					<span className="plugin-row-formatter__plugin-details">
						{ item?.isSelectable && (
							<FormInputCheckbox
								className="plugin-row-formatter__checkbox"
								id={ item.slug }
								onClick={ item.onClick }
								checked={ item.isSelected }
								readOnly={ true }
							/>
						) }
						{ item.icon ? (
							<img
								className="plugin-row-formatter__plugin-icon"
								src={ item.icon }
								alt={ item.name }
							/>
						) : (
							<Gridicon className="plugin-row-formatter__plugin-icon has-opacity" icon="plugins" />
						) }
						<PluginDetailsButton className="plugin-row-formatter__plugin-name">
							{ item.name }
						</PluginDetailsButton>
					</span>
					<span className="plugin-row-formatter__overlay"></span>
				</span>
			);
		case 'sites':
			return isSmallScreen ? (
				translate(
					'Installed on %(count)d site',
					'Installed on %(count)d sites', // plural version of the string
					{
						count: siteCount,
						args: { count: siteCount },
					}
				)
			) : (
				<PluginDetailsButton className="plugin-row-formatter__sites-count-button">
					{ siteCount }
				</PluginDetailsButton>
			);
		case 'activate':
			return (
				canActivate && (
					<div className="plugin-row-formatter__toggle">
						<PluginActivateToggle
							isJetpackCloud
							hideLabel={ ! isSmallScreen }
							plugin={ pluginOnSite }
							site={ selectedSite }
							disabled={ !! item?.isSelectable }
						/>
					</div>
				)
			);
		case 'autoupdate':
			return (
				canUpdate && (
					<div className="plugin-row-formatter__toggle">
						<PluginAutoupdateToggle
							hideLabel={ ! isSmallScreen }
							plugin={ pluginOnSite }
							site={ selectedSite }
							wporg={ !! item.wporg }
							isMarketplaceProduct={ isMarketplaceProduct( state, item?.slug ) }
							disabled={ !! item?.isSelectable }
						/>
					</div>
				)
			);
		case 'last-updated':
			if ( item.last_updated ) {
				return isSmallScreen
					? translate( 'Last updated %(ago)s', {
							args: {
								ago: ago( item.last_updated ),
							},
					  } )
					: ago( item.last_updated );
			}
			return null;
		case 'update':
			return <UpdatePlugin plugin={ item } selectedSite={ selectedSite } className={ className } />;
		case 'install':
			return (
				<div className="plugin-row-formatter__install-plugin">
					<PluginInstallButton
						isEmbed
						isJetpackCloud
						selectedSite={ selectedSite }
						plugin={ item }
						isInstalling={ installInProgress }
					/>
				</div>
			);
	}
}
