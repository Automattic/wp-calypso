import { Gridicon, Button } from '@automattic/components';
import classNames from 'classnames';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import type { PluginColumns, PluginRowFormatterArgs } from '../types';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	isLoading: boolean;
	columns: PluginColumns;
	items: Array< any >;
	rowFormatter: ( args: PluginRowFormatterArgs ) => ReactNode;
	hasMoreActions: boolean;
	primaryKey: string;
}

export default function PluginsTable( {
	isLoading,
	columns,
	items,
	rowFormatter,
	hasMoreActions,
	primaryKey,
}: Props ): ReactElement {
	return (
		<table className="plugins-table__table">
			<thead>
				<tr>
					{ columns
						.filter( ( column ) => column.title )
						.map( ( column ) => (
							<th colSpan={ column.colSpan || 1 } key={ column.key }>
								{ column.title }
							</th>
						) ) }
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ isLoading ? (
					<tr>
						{ columns.map( ( column ) => (
							<td key={ column.key }>
								{ column.key === 'plugin' && (
									<Gridicon className="plugins-table__plugin-icon is-loading" icon="plugins" />
								) }
								<TextPlaceholder />
							</td>
						) ) }
						<td>
							<TextPlaceholder />
						</td>
					</tr>
				) : (
					items.map( ( item ) => {
						const id = item[ primaryKey ];
						return (
							<tr key={ `table-row-${ id }` } className="plugins-table__table-row">
								{ columns.map( ( column ) => {
									return (
										<td
											className={ classNames(
												column.smallColumn && 'plugins-table__small-column'
											) }
											key={ `table-data-${ column.key }-${ id }` }
										>
											{ rowFormatter( { columnKey: column.key, item } ) }
										</td>
									);
								} ) }
								{ hasMoreActions && (
									<td className={ classNames( 'plugins-table__actions' ) }>
										<Button borderless compact>
											<Gridicon
												icon="ellipsis"
												size={ 18 }
												className="plugins-table__all-actions"
											/>
										</Button>
									</td>
								) }
							</tr>
						);
					} )
				) }
			</tbody>
		</table>
	);
}
