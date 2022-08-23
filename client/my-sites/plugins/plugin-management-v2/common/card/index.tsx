import { Gridicon, Card, Button } from '@automattic/components';
import classNames from 'classnames';
import type { Columns, RowFormatterArgs } from '../../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	item: any;
	selectedSite: SiteData;
	rowFormatter: ( args: RowFormatterArgs ) => ReactNode;
	columns: Columns;
	hasMoreActions: boolean;
}

export default function Card( {
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
		<Card className="card__card" compact>
			<div className="card__columns">
				{ showLeftContent && (
					<div className="card__left-content">
						{ item.icon ? (
							<img className="card__plugin-icon" src={ item.icon } alt={ item.name } />
						) : (
							<Gridicon className="card__plugin-icon has-opacity" icon="plugins" />
						) }
					</div>
				) }
				<div
					className={ classNames( 'card__main-content', {
						'no-padding': ! showLeftContent,
					} ) }
				>
					{ columnKeys[ 'plugin' ] && (
						<div>
							{ rowFormatter( { columnKey: 'plugin', item, isSmallScreen: true } ) }
							<span className="card__overlay"></span>
						</div>
					) }
					{ columnKeys[ 'last-updated' ] && (
						<div className="card__site-data">
							{ rowFormatter( {
								columnKey: 'last-updated',
								item,
								isSmallScreen: true,
							} ) }
						</div>
					) }
					{ ( columnKeys[ 'active' ] || columnKeys[ 'autoupdate' ] ) && (
						<div className="card__toggle-container">
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
						<div className="card__site-data">
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
							className: 'card__update-plugin',
						} ) }
				</div>
				{ hasMoreActions && (
					<div className="card__right-content">
						<Button borderless compact>
							<Gridicon icon="ellipsis" size={ 18 } className="card__all-actions" />
						</Button>
					</div>
				) }
			</div>
		</Card>
	);
}
