import classNames from 'classnames';
import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import useFetchTestConnection from 'calypso/data/agency-dashboard/use-fetch-test-connection';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import SiteActions from '../site-actions';
import SiteErrorContent from '../site-error-content';
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	columns: SiteColumns;
	item: SiteData;
}

export default function SiteTableRow( { columns, item }: Props ) {
	const site = item.site;
	const blogId = site.value.blog_id;
	const siteError = site.error || item.monitor.error;
	const isFavorite = item.isFavorite;

	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	// eslint-disable-next-line
	const { data, isError, isLoading, refetch } = useFetchTestConnection(
		isPartnerOAuthTokenLoaded,
		blogId
	);

	return (
		<Fragment>
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
}
