import classNames from 'classnames';
import { ReactElement, Fragment } from 'react';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteActions from '../site-actions';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	isFetching: boolean;
	columns: SiteColumns;
	items: Array< SiteData >;
}

export default function SiteTable( { isFetching, columns, items }: Props ): ReactElement {
	return (
		<table className="site-table__table">
			<thead>
				<tr>
					{ columns.map( ( column ) => (
						<th key={ column.key }>{ column.title }</th>
					) ) }
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ isFetching ? (
					<tr>
						{ columns.map( ( column ) => (
							<td key={ column.key }>
								<TextPlaceholder />
							</td>
						) ) }
						<td>
							<TextPlaceholder />
						</td>
					</tr>
				) : (
					items.map( ( item ) => {
						const site = item.site;
						const blogId = site.value.blog_id;
						return (
							<Fragment key={ `table-row-${ blogId }` }>
								<tr className="site-table__table-row">
									{ columns.map( ( column ) => {
										const row = item[ column.key ];
										if ( row.type ) {
											return (
												<td
													className={ classNames( site.error && 'site-table__td-with-error' ) }
													key={ `table-data-${ row.type }-${ blogId }` }
												>
													<SiteStatusContent rows={ item } type={ row.type } />
												</td>
											);
										}
									} ) }
									<td
										className={ classNames(
											site.error && 'site-table__td-with-error',
											'site-table__actions'
										) }
									>
										<SiteActions isLargeScreen site={ site } />
									</td>
								</tr>
								{ site.error ? (
									<tr className="site-table__connection-error">
										<td colSpan={ Object.keys( item ).length + 1 }>
											{ <SiteErrorContent siteUrl={ site.value.url } /> }
										</td>
									</tr>
								) : null }
							</Fragment>
						);
					} )
				) }
			</tbody>
		</table>
	);
}
