import { Gridicon, Card, Button } from '@automattic/components';
import classNames from 'classnames';
import type { PluginColumns, PluginRowFormatterArgs } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	item: any;
	selectedSite: SiteData;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	columns: PluginColumns;
	hasMoreActions: boolean;
}

export default function PluginCard( {
	item,
	selectedSite,
	rowFormatter,
	columns,
	hasMoreActions,
}: Props ): ReactElement {
	const columnKeys: { [ key: string ]: boolean } = columns.reduce(
		( obj, cur ) => ( { ...obj, [ cur.key ]: true } ),
		{}
	);

	const showLeftContent = columnKeys[ 'plugin' ];

	return (
		<Card className="plugin-card__card" compact>
			<div className="plugin-card__columns">
				{ showLeftContent && (
					<div className="plugin-card__left-content">
						{ item.icon ? (
							<img className="plugin-card__plugin-icon" src={ item.icon } alt={ item.name } />
						) : (
							<Gridicon className="plugin-card__plugin-icon has-opacity" icon="plugins" />
						) }
					</div>
				) }
				<div
					className={ classNames( 'plugin-card__main-content', {
						'no-padding': ! showLeftContent,
					} ) }
				>
					{ columnKeys[ 'plugin' ] && (
						<div>
							{ rowFormatter( { columnKey: 'plugin', item, isSmallScreen: true } ) }
							<span className="plugin-card__overlay"></span>
						</div>
					) }
					{ columnKeys[ 'last-updated' ] && (
						<div className="plugin-card__site-data">
							{ rowFormatter( {
								columnKey: 'last-updated',
								item,
								isSmallScreen: true,
							} ) }
						</div>
					) }
					{ ( columnKeys[ 'active' ] || columnKeys[ 'autoupdate' ] ) && (
						<div className="plugin-card__toggle-container">
							{ columnKeys[ 'activate' ] && (
								<div>
									{ rowFormatter( {
										columnKey: 'activate',
										item,
										isSmallScreen: true,
										selectedSite,
									} ) }
								</div>
							) }
							{ columnKeys[ 'autoupdate' ] && (
								<div>
									{ rowFormatter( {
										columnKey: 'autoupdate',
										item,
										isSmallScreen: true,
										selectedSite,
									} ) }
								</div>
							) }
						</div>
					) }
					{ columnKeys[ 'sites' ] && (
						<div className="plugin-card__site-data">
							{ rowFormatter( {
								columnKey: 'sites',
								item,
								isSmallScreen: true,
							} ) }
						</div>
					) }
					{ columnKeys[ 'update' ] &&
						rowFormatter( {
							columnKey: 'update',
							item,
							isSmallScreen: true,
							className: 'plugin-card__update-plugin',
						} ) }
				</div>
				{ hasMoreActions && (
					<div className="plugin-card__right-content">
						<Button borderless compact>
							<Gridicon icon="ellipsis" size={ 18 } className="plugin-card__all-actions" />
						</Button>
					</div>
				) }
			</div>
		</Card>
	);
}
