import classNames from 'classnames';
import { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFetchTestConnection from 'calypso/data/agency-dashboard/use-fetch-test-connection';
import { resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	getSelectedLicenses,
	getSelectedLicensesSiteId,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import SiteActions from '../site-actions';
import SiteErrorContent from '../site-error-content';
import SiteExpandedContent from '../site-expanded-content';
import SitePhpVersion from '../site-expanded-content/site-php-version';
import SiteStatusContent from '../site-status-content';
import SiteTableExpand from '../site-table-expand';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	index: number;
	columns: SiteColumns;
	item: SiteData;
	setExpanded: () => void;
	isExpanded: boolean;
}

export default function SiteTableRow( { index, columns, item, setExpanded, isExpanded }: Props ) {
	const dispatch = useDispatch();

	const site = item.site;
	const blogId = site.value.blog_id;
	const isConnectionHealthy = site.value?.is_connection_healthy;
	const isFavorite = item.isFavorite;

	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );
	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	useFetchTestConnection( isPartnerOAuthTokenLoaded, isConnectionHealthy, blogId );

	const currentSiteHasSelectedLicenses =
		selectedLicensesSiteId === blogId && selectedLicenses?.length;

	// We should disable the license selection for all sites, but the active one.
	const shouldDisableLicenseSelection =
		selectedLicenses?.length && ! currentSiteHasSelectedLicenses;

	const hasSiteConnectionError = ! item.site.value.is_connected;
	const siteError = item.monitor.error || hasSiteConnectionError;

	return (
		<Fragment>
			<tr
				className={ classNames( 'site-table__table-row', {
					'site-table__table-row-disabled': shouldDisableLicenseSelection,
					'site-table__table-row-active': currentSiteHasSelectedLicenses,
					'site-table__table-row-site-error': hasSiteConnectionError,
					'is-expanded': isExpanded,
				} ) }
				onClick={ ( event ) => {
					if ( ! shouldDisableLicenseSelection ) {
						// Click event should continue work as-is.
						return;
					}

					dispatch( resetSite() );
					event.preventDefault();
				} }
			>
				{ columns.map( ( column ) => {
					const row = item[ column.key ];
					if ( hasSiteConnectionError && column.key !== 'site' ) {
						return null;
					}
					const isCritical = 'critical' === row.status;
					if ( row.type ) {
						return (
							<td
								className={ classNames( column.className, {
									'site-table__td-without-border-bottom': isExpanded,
									'site-table__td-critical': isCritical,
								} ) }
								key={ `table-data-${ row.type }-${ blogId }` }
							>
								<SiteStatusContent
									rows={ item }
									type={ row.type }
									isLargeScreen
									isFavorite={ isFavorite }
									siteError={ siteError }
								/>
							</td>
						);
					}
				} ) }
				{ /* Show error content when there is a site error */ }
				{ hasSiteConnectionError && (
					<td
						className={ classNames( 'site-table__error padding-0', {
							'site-table__td-without-border-bottom': isExpanded,
						} ) }
						// If there is an error, we need to span the whole row because we don't show any column.
						colSpan={ columns.length - 1 }
					>
						<SiteErrorContent siteUrl={ site.value.url } />
					</td>
				) }
				<td
					className={ classNames( 'site-table__actions site-table__actions-button', {
						'site-table__td-without-border-bottom': isExpanded,
					} ) }
				>
					<SiteActions isLargeScreen site={ site } siteError={ siteError } />
				</td>
				<SiteTableExpand
					index={ index }
					isExpanded={ isExpanded }
					setExpanded={ setExpanded }
					siteId={ site.value.blog_id }
				/>
			</tr>
			{ /* Show expanded content when expandable block is enabled. */ }
			{ isExpanded && (
				<tr className="site-table__table-row-expanded">
					<td colSpan={ Object.keys( item ).length + 1 }>
						<SiteExpandedContent site={ site.value } hasError={ siteError } />
						<SitePhpVersion phpVersion={ site.value.php_version_num } />
					</td>
				</tr>
			) }
		</Fragment>
	);
}
