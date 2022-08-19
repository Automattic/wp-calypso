import { Gridicon, Card, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PluginRowFormatter from '../plugin-row-formatter';
import UpdatePlugin from '../update-plugin';
import type { Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	item: Plugin;
	selectedSite: SiteData;
}

export default function PluginCard( { item, selectedSite }: Props ): ReactElement {
	const translate = useTranslate();

	return (
		<Card className="plugin-card__card" compact>
			<div className="plugin-card__columns">
				<div className="plugin-card__left-content">
					{ item.icon ? (
						<img className="plugin-card__plugin-icon" src={ item.icon } alt={ item.name } />
					) : (
						<Gridicon className="plugin-card__plugin-icon has-opacity" icon="plugins" />
					) }
				</div>
				<div className="plugin-card__main-content">
					<div>
						<PluginRowFormatter isSmallScreen item={ item } columnKey="plugin" />
						<span className="plugin-card__overlay"></span>
					</div>
					{ selectedSite ? (
						<>
							<div className="plugin-card__site-data">
								<PluginRowFormatter isSmallScreen columnKey="last-updated" item={ item } />
							</div>
							<div className="plugin-card__toggle-container">
								<div>
									<PluginRowFormatter
										isSmallScreen
										columnKey="activate"
										item={ item }
										selectedSite={ selectedSite }
									/>
								</div>
								<div>
									<PluginRowFormatter
										isSmallScreen
										columnKey="autoupdate"
										item={ item }
										selectedSite={ selectedSite }
									/>
								</div>
							</div>
						</>
					) : (
						<div className="plugin-card__site-data">
							{ translate( 'Installed on %(count)d sites', {
								args: { count: Object.keys( item.sites ).length },
							} ) }
						</div>
					) }
					<UpdatePlugin
						plugin={ item }
						selectedSite={ selectedSite }
						className="plugin-card__update-plugin"
					/>
				</div>
				<div className="plugin-card__right-content">
					<Button borderless compact>
						<Gridicon icon="ellipsis" size={ 18 } className="plugin-card__all-actions" />
					</Button>
				</div>
			</div>
		</Card>
	);
}
