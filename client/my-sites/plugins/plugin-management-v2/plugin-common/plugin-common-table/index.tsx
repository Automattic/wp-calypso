import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import PluginCommonAction from '../plugin-common-actions';
import type { Columns, RowFormatterArgs } from '../../types';
import type { ReactElement, ReactNode } from 'react';

import './style.scss';

interface Props {
	isLoading: boolean;
	columns: Columns;
	items: Array< any >;
	rowFormatter: ( args: RowFormatterArgs ) => ReactNode;
	primaryKey: string;
	renderActions?: ( args: any ) => ReactElement;
	className?: string;
}

export default function PluginCommonTable( {
	isLoading,
	columns,
	items,
	rowFormatter,
	primaryKey,
	renderActions,
	className,
}: Props ): ReactElement {
	return (
		<table className={ classNames( 'plugin-common-table__table', className ) }>
			<thead>
				<tr>
					{ columns
						.filter( ( column ) => column.header )
						.map( ( column ) => (
							<th colSpan={ column.colSpan || 1 } key={ column.key }>
								{ column.header }
							</th>
						) ) }
					{ renderActions && <th></th> }
				</tr>
			</thead>
			<tbody>
				{ isLoading ? (
					<tr>
						{ columns.map( ( column ) => (
							<td key={ column.key }>
								{ column.key === 'plugin' && (
									<Gridicon
										className="plugin-common-table__plugin-icon is-loading"
										icon="plugins"
									/>
								) }
								<TextPlaceholder />
							</td>
						) ) }
						{ renderActions && (
							<td>
								<TextPlaceholder />
							</td>
						) }
					</tr>
				) : (
					items.map( ( item ) => {
						const id = item[ primaryKey ];
						return (
							<tr key={ `table-row-${ id }` } className="plugin-common-table__table-row">
								{ columns.map( ( column ) => {
									return (
										<td
											className={ classNames(
												column.smallColumn && 'plugin-common-table__small-column'
											) }
											key={ `table-data-${ column.key }-${ id }` }
										>
											{ rowFormatter( { columnKey: column.key, item } ) }
										</td>
									);
								} ) }
								{ renderActions && (
									<td className={ classNames( 'plugin-common-table__actions' ) }>
										<PluginCommonAction item={ item } renderActions={ renderActions } />
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
