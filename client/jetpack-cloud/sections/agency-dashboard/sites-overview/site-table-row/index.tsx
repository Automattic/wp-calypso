import { isEnabled } from '@automattic/calypso-config';
import { Icon, lineSolid } from '@wordpress/icons';
import clsx from 'clsx';
import { Fragment, useContext } from 'react';
import useFetchTestConnection from 'calypso/data/agency-dashboard/use-fetch-test-connection';
import { useDispatch, useSelector } from 'calypso/state';
import { resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	getSelectedLicenses,
	getSelectedSiteLicenses,
	getSelectedLicensesSiteId,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import SitesOverviewContext from '../context';
import useDefaultSiteColumns from '../hooks/use-default-site-columns';
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

	const defaultSiteColumnKeys = useDefaultSiteColumns().map( ( { key } ) => key );
	const { mostRecentConnectedSite } = useContext( SitesOverviewContext );

	const site = item.site;
	const blogId = site.value.blog_id;
	const isConnectionHealthy = site.value?.is_connection_healthy;
	const isFavorite = item.isFavorite;

	const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );
	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedSiteLicenses = useSelector( getSelectedSiteLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	const { data } = useFetchTestConnection( isPartnerOAuthTokenLoaded, isConnectionHealthy, blogId );
	const isConnected = data?.connected ?? true;

	const currentSiteHasSelectedLicenses =
		selectedLicensesSiteId === blogId && selectedLicenses?.length;

	// We should disable the license selection for all sites, but the active one.
	const shouldDisableLicenseSelection = isStreamlinedPurchasesEnabled
		? selectedSiteLicenses?.length
		: selectedLicenses?.length && ! currentSiteHasSelectedLicenses;

	const hasSiteConnectionError = ! isConnected;
	const siteError = item.monitor.error || hasSiteConnectionError;
	const isMostRecentJetpackConnectedSite = mostRecentConnectedSite === site.value.url;
	const isUrlOnly = site?.value?.sticker?.includes( 'jetpack-manage-url-only-site' );

	return (
		<Fragment>
			<tr
				className={ clsx( 'site-table__table-row', {
					'site-table__table-row-disabled': shouldDisableLicenseSelection,
					'site-table__table-row-active': currentSiteHasSelectedLicenses,
					'site-table__table-row-site-error': hasSiteConnectionError,
					'is-expanded': isExpanded,
					'is-most-recent-jetpack-connected-site': isMostRecentJetpackConnectedSite,
				} ) }
				onClick={ ( event ) => {
					if ( ! shouldDisableLicenseSelection ) {
						// Click event should continue work as-is.
						return;
					}
					if ( ! isStreamlinedPurchasesEnabled ) {
						dispatch( resetSite() );
					}
					event.preventDefault();
				} }
			>
				{ columns.map( ( column ) => {
					const row = item[ column.key ];
					if ( hasSiteConnectionError && column.key !== 'site' ) {
						return null;
					}

					if ( isUrlOnly && ! [ 'site', 'monitor' ].includes( column.key ) ) {
						return (
							<td
								className={ clsx( column.className, {
									'site-table__td-is-url-only': isUrlOnly,
								} ) }
								key={ `table-data-${ row.type }-${ blogId }` }
							>
								<Icon className="site-table__empty-icon" icon={ lineSolid } />
							</td>
						);
					}

					const isCritical = 'critical' === row.status;
					if ( row.type ) {
						return (
							<td
								className={ clsx( column.className, {
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
									siteError={ hasSiteConnectionError }
								/>
							</td>
						);
					}
				} ) }
				{ /* Show error content when there is a site error */ }
				{ hasSiteConnectionError && (
					<td
						className={ clsx( 'site-table__error padding-0', {
							'site-table__td-without-border-bottom': isExpanded,
						} ) }
						// If there is an error, we need to span the whole row because we don't show any column.
						colSpan={ columns.length - 1 }
					>
						<SiteErrorContent siteUrl={ site.value.url } />
					</td>
				) }
				<td
					className={ clsx( 'site-table__actions site-table__actions-button', {
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
						<SiteExpandedContent
							columns={ defaultSiteColumnKeys }
							site={ site.value }
							hasError={ siteError }
						/>
						<SitePhpVersion phpVersion={ site.value.php_version_num } />
					</td>
				</tr>
			) }
		</Fragment>
	);
}
