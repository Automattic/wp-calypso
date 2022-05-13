import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import React from 'react';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteErrorContent from '../site-error-content';

import './style.scss';

const SiteTable = ( { isFetching, columns, sites } ) => {
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
					sites.map( ( rows, i ) => {
						const site = rows.site;
						return (
							<React.Fragment key={ i }>
								<tr className="site-table__table-row">
									{ Object.keys( rows ).map( ( key, index ) => {
										if ( rows[ key ].formatter ) {
											return (
												<td
													className={ classNames( site.error && 'site-table__td-with-error' ) }
													key={ index }
												>
													{ rows[ key ].formatter( rows ) }
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
										<td colSpan={ Object.keys( rows ).length + 1 }>
											{ <SiteErrorContent siteUrl={ site.value.url } /> }
										</td>
									</tr>
								) : null }
							</React.Fragment>
						);
					} )
				) }
			</tbody>
		</table>
	);
};

export default SiteTable;
