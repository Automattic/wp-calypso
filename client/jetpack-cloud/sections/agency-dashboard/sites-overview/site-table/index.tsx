import { Icon, starFilled } from '@wordpress/icons';
import classNames from 'classnames';
import { ReactElement, Fragment } from 'react';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteActions from '../site-actions';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	isLoading: boolean;
	columns: SiteColumns;
	items: Array< SiteData >;
}

export default function SiteTable( { isLoading, columns, items }: Props ): ReactElement {
	return (
		<table className="site-table__table">
			<thead>
				<tr>
					{ columns.map( ( column, index ) => (
						<th key={ column.key }>
							{ index === 0 && (
								<Icon className="site-table__favorite-icon" size={ 24 } icon={ starFilled } />
							) }
							<span className={ classNames( index === 0 && 'site-table-site-title' ) }>
								{ column.title }
							</span>
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
						const siteError = site.error || item.monitor.error;
						const isFavorite = item.isFavorite;
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
													<SiteStatusContent
														rows={ item }
														type={ row.type }
														isLargeScreen
														isFavorite={ isFavorite }
													/>
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
										<SiteActions isLargeScreen site={ site } siteError={ siteError } />
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
