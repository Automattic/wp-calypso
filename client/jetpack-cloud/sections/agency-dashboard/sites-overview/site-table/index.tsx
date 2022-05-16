import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { ReactElement, Fragment } from 'react';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { AllowedTypes } from '../types';
import type { ReactChild } from 'react';

import './style.scss';

interface Props {
	isFetching: boolean;
	columns: {
		site: ReactChild;
		backup: ReactChild;
		scan: ReactChild;
		monitor: ReactChild;
		plugin: ReactChild;
	};
	items: Array< {
		site: {
			value: { blog_id: number; url: string };
			error: string;
			type: AllowedTypes;
			status: string;
		};
		[ key: string ]: { type: AllowedTypes };
	} >;
}

export default function SiteTable( { isFetching, columns, items }: Props ): ReactElement {
	return (
		<table className="site-table__table">
			<thead>
				<tr>
					{ Object.values( columns ).map( ( column, index ) => (
						<th key={ index }>{ column }</th>
					) ) }
					<th></th>
				</tr>
			</thead>
			<tbody>
				{ isFetching ? (
					<tr>
						{ Object.keys( columns ).map( ( key, index ) => (
							<td key={ index }>
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
									{ Object.keys( item ).map( ( key ) => {
										const row = item[ key ];
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
										<Gridicon icon="ellipsis" size={ 18 } className="site-table__all-actions" />
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
