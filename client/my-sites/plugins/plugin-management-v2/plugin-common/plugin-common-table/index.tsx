import { Icon, plugins } from '@wordpress/icons';
import clsx from 'clsx';
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
}: Props ) {
	return (
		<table className={ clsx( 'plugin-common-table__table', className ) }>
			<thead>
				<tr>
					{ columns
						.filter( ( column ) => column.header )
						.map( ( column ) => (
							<th colSpan={ column.colSpan || 1 } key={ column.key }>
								{ column.header }
							</th>
						) ) }
				</tr>
			</thead>
			<tbody>
				{ isLoading ? (
					<tr>
						{ columns.map( ( column ) => (
							<td key={ column.key }>
								{ column.key === 'plugin' && (
									<Icon
										size={ 32 }
										icon={ plugins }
										className="plugin-common-table__plugin-icon plugin-default-icon is-loading"
									/>
								) }
								<TextPlaceholder />
							</td>
						) ) }
					</tr>
				) : (
					items.map( ( item ) => {
						const id = item[ primaryKey ];
						return (
							<tr key={ `table-row-${ id }` } className="plugin-common-table__table-row">
								{ columns.map( ( column ) => {
									if ( column.key === 'bulk-actions' ) {
										// We don't want to render an empty table cell for the bulk actions.
										return null;
									}
									return (
										<td
											className={ clsx(
												column.smallColumn && 'plugin-common-table__small-column'
											) }
											key={ `table-data-${ column.key }-${ id }` }
											// As we don't render the bulk actions cell, we can
											// expand the update column a bit further.
											colSpan={ column.key === 'update' ? 2 : undefined }
										>
											{ rowFormatter( { columnKey: column.key, item } ) }
										</td>
									);
								} ) }
								{ renderActions && (
									<td className={ clsx( 'plugin-common-table__actions' ) }>
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
