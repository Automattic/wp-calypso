import { Gridicon, Button } from '@automattic/components';
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
	selectedSite: SiteData;
}

export default function PluginRowFormatter( {
	item,
	columnKey,
	selectedSite,
}: Props ): ReactElement | any {
	const PluginDetailsButton = ( props: { className: string; children: ReactChild } ) => {
		return <Button borderless compact href={ `/plugins/${ item.slug }` } { ...props } />;
	};

	const moment = useLocalizedMoment();
	const state = useSelector( ( state ) => state );

	const ago = ( date: MomentInput ) => {
		return moment.utc( date, 'YYYY-MM-DD hh:mma' ).fromNow();
	};

	const { activation: canActivate, autoupdate: canUpdate } = getAllowedPluginActions(
		item,
		state,
		selectedSite
	);

	switch ( columnKey ) {
		case 'plugin':
			return (
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
				canActivate && <PluginActivateToggle hideLabel plugin={ item } site={ selectedSite } />
			);
		case 'autoupdate':
			return (
				canUpdate && (
					<PluginAutoupdateToggle
						hideLabel
						plugin={ item }
						site={ selectedSite }
						wporg={ !! item.wporg }
						isMarketplaceProduct={ isMarketplaceProduct( state, item?.slug ) }
					/>
				)
			);
		case 'last-updated':
			if ( item.last_updated ) {
				return <div>{ ago( item.last_updated ) }</div>;
			}
			return null;
	}
}
