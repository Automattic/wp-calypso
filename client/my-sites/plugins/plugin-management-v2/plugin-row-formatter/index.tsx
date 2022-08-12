import { Gridicon, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import type { Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { MomentInput } from 'moment';
import type { ReactElement, ReactChild } from 'react';

import './style.scss';

interface Props {
	item: Plugin;
	columnKey: string;
	selectedSite?: SiteData;
	isSmallScreen?: boolean;
}

export default function PluginRowFormatter( {
	item,
	columnKey,
	selectedSite,
	isSmallScreen,
}: Props ): ReactElement | any {
	const translate = useTranslate();

	const PluginDetailsButton = ( props: { className: string; children: ReactChild } ) => {
		return <Button borderless compact href={ `/plugins/${ item.slug }` } { ...props } />;
	};

	const moment = useLocalizedMoment();
	const state = useSelector( ( state ) => state );

	const ago = ( date: MomentInput ) => {
		return moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	};

	let canActivate;
	let canUpdate;

	if ( selectedSite ) {
		const { activation, autoupdate } = getAllowedPluginActions( item, state, selectedSite );
		canActivate = activation;
		canUpdate = autoupdate;
	}

	switch ( columnKey ) {
		case 'plugin':
			return isSmallScreen ? (
				<PluginDetailsButton className="plugin-row-formatter__plugin-name-card">
					{ item.name }
				</PluginDetailsButton>
			) : (
				<span className="plugin-row-formatter__plugin-name-container">
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
					<span className="plugin-row-formatter__overlay"></span>
				</span>
			);
		case 'sites':
			return (
				<PluginDetailsButton className="plugin-row-formatter__sites-count-button">
					{ Object.keys( item.sites ).length }
				</PluginDetailsButton>
			);
		case 'activate':
			return (
				canActivate && (
					<div className="plugin-row-formatter__toggle">
						<PluginActivateToggle
							hideLabel={ ! isSmallScreen }
							plugin={ item }
							site={ selectedSite }
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
							plugin={ item }
							site={ selectedSite }
							wporg={ !! item.wporg }
							isMarketplaceProduct={ isMarketplaceProduct( state, item?.slug ) }
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
	}
}
