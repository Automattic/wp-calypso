import { Button } from '@automattic/components';
import { Icon, plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { INSTALL_PLUGIN, UPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import UpdatePlugin from 'calypso/my-sites/plugins/plugin-management-v2/update-plugin';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import {
	isPluginActionInProgress,
	getPluginOnSite,
} from 'calypso/state/plugins/installed/selectors';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import PluginActionStatus from '../plugin-action-status';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import { getPluginActionStatuses } from '../utils/get-plugin-action-statuses';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { MomentInput } from 'moment';
import type { MouseEventHandler, PropsWithChildren } from 'react';

import './style.scss';

interface Props {
	item: PluginComponentProps;
	columnKey: string;
	selectedSite?: SiteDetails;
	isSmallScreen?: boolean;
	className?: string;
	updatePlugin?: ( plugin: PluginComponentProps ) => void;
	siteCount?: number;
}

export default function PluginRowFormatter( {
	item,
	columnKey,
	selectedSite,
	isSmallScreen,
	className,
	updatePlugin,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const billingPeriod = useSelector( getBillingInterval );
	const pluginId = item.id || item.slug; // Plugin ID only available on Site plugin item object

	const PluginDetailsButton = (
		props: PropsWithChildren< { className: string; onClick?: MouseEventHandler } >
	) => {
		return (
			<Button
				borderless
				compact
				href={ `/plugins/${ item.slug }${ selectedSite ? `/${ selectedSite.domain }` : '' }` }
				{ ...props }
			/>
		);
	};

	const trackPluginDetailsButtonClick =
		( siteId: number | undefined, pluginSlug: string ) => () => {
			dispatch(
				recordTracksEvent( 'calypso_plugin_details_click', { site: siteId, plugin: pluginSlug } )
			);
		};

	const trackPluginSiteCountButtonClick =
		( siteId: number | undefined, pluginSlug: string ) => () => {
			dispatch(
				recordTracksEvent( 'calypso_plugin_site_count_click', { site: siteId, plugin: pluginSlug } )
			);
		};

	const moment = useLocalizedMoment();

	const ago = ( date: MomentInput ) => {
		return moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	};

	let canActivate;
	let canUpdate;

	const installInProgress = useSelector(
		( state ) =>
			selectedSite && isPluginActionInProgress( state, selectedSite.ID, pluginId, INSTALL_PLUGIN )
	);

	const { activation, autoupdate } = useSelector( ( state ) =>
		getAllowedPluginActions( item, state, selectedSite )
	);

	if ( selectedSite ) {
		canActivate = activation;
		canUpdate = autoupdate;
	}

	const pluginOnSite = useSelector(
		( state ) => selectedSite && getPluginOnSite( state, selectedSite.ID, item.slug )
	);

	const siteCount = item?.sites && Object.keys( item.sites ).length;

	const isFromMarketplace = useSelector( ( state ) => isMarketplaceProduct( state, item?.slug ) );
	const allStatuses = useSelector( ( state ) => getPluginActionStatuses( state ) );

	let currentSiteStatuses = allStatuses.filter(
		( status ) => status.pluginId === pluginId && status.action !== UPDATE_PLUGIN
	);

	if ( 'site-name' === columnKey ) {
		currentSiteStatuses = currentSiteStatuses.filter(
			( status ) => parseInt( status.siteId ) === selectedSite?.ID
		);
	}

	const pluginActionStatus =
		currentSiteStatuses.length > 0 ? (
			<PluginActionStatus
				currentSiteStatuses={ currentSiteStatuses }
				selectedSite={ selectedSite }
			/>
		) : null;

	switch ( columnKey ) {
		case 'site-name':
			return (
				<span className="plugin-row-formatter__row-container">
					<span className="plugin-row-formatter__site-name">{ selectedSite?.domain }</span>
					{ /* Overlay for small screen is added in the card component */ }
					{ ! isSmallScreen && <span className="plugin-row-formatter__overlay"></span> }
					{ pluginActionStatus && (
						<div className="plugin-row-formatter__action-status">{ pluginActionStatus }</div>
					) }
				</span>
			);
		case 'plugin':
			return isSmallScreen ? (
				<>
					<PluginDetailsButton
						className="plugin-row-formatter__plugin-name-card"
						onClick={ trackPluginDetailsButtonClick( selectedSite?.ID, item.slug ) }
					>
						{ item.name }
					</PluginDetailsButton>
					{ pluginActionStatus }
				</>
			) : (
				<span className="plugin-row-formatter__row-container">
					<span className="plugin-row-formatter__plugin-details">
						{ item?.isSelectable && (
							<FormInputCheckbox
								className="plugin-row-formatter__checkbox"
								id={ item.slug }
								onClick={ item.onClick }
								checked={ item.isSelected }
								readOnly
							/>
						) }
						{ item.icon ? (
							<img
								className="plugin-row-formatter__plugin-icon"
								src={ item.icon }
								alt={ item.name }
							/>
						) : (
							<Icon
								size={ 32 }
								icon={ plugins }
								className="plugin-row-formatter__plugin-icon plugin-default-icon"
							/>
						) }
						<div className="plugin-row-formatter__plugin-name-container">
							<PluginDetailsButton
								className="plugin-row-formatter__plugin-name"
								onClick={ trackPluginDetailsButtonClick( selectedSite?.ID, item.slug ) }
							>
								{ item.name }
							</PluginDetailsButton>
							<span className="plugin-row-formatter__overlay"></span>
							{ pluginActionStatus }
						</div>
					</span>
				</span>
			);
		case 'sites':
			return isSmallScreen ? (
				<>
					{ translate(
						'Installed on %(count)d site',
						'Installed on %(count)d sites', // plural version of the string
						{
							count: siteCount,
							args: { count: siteCount },
						}
					) }
				</>
			) : (
				<PluginDetailsButton
					className="plugin-row-formatter__sites-count-button"
					onClick={ trackPluginSiteCountButtonClick( selectedSite?.ID, item.slug ) }
				>
					{ siteCount }
				</PluginDetailsButton>
			);
		case 'activate':
			return canActivate ? (
				<div className="plugin-row-formatter__toggle">
					<PluginActivateToggle
						isJetpackCloud
						hideLabel={ ! isSmallScreen }
						plugin={ pluginOnSite }
						site={ selectedSite }
						disabled={ !! item?.isSelectable }
					/>
				</div>
			) : null;
		case 'autoupdate':
			return canUpdate ? (
				<div className="plugin-row-formatter__toggle">
					<PluginAutoupdateToggle
						plugin={ pluginOnSite }
						site={ selectedSite }
						wporg={ !! item.wporg }
						isMarketplaceProduct={ isFromMarketplace }
						disabled={ !! item?.isSelectable }
					/>
				</div>
			) : null;
		case 'last-updated':
			return item?.update && item?.last_updated ? (
				<span className="plugin-row-formatter__last-updated">
					{ translate( '{{span}}Updated{{/span}} %(ago)s', {
						components: {
							span: <span />,
						},
						args: {
							ago: ago( item.last_updated ),
						},
					} ) }
				</span>
			) : null;
		case 'update':
			return (
				<UpdatePlugin
					plugin={ item }
					selectedSite={ selectedSite }
					className={ className }
					updatePlugin={ updatePlugin }
					siteCount={ siteCount }
				/>
			);
		case 'install':
			return (
				<div className="plugin-row-formatter__install-plugin">
					<PluginInstallButton
						isEmbed
						isJetpackCloud
						selectedSite={ selectedSite }
						plugin={ item }
						isInstalling={ installInProgress }
						billingPeriod={ billingPeriod }
					/>
				</div>
			);
		case 'bulk-actions':
			return null;
		default:
			return null;
	}
}
