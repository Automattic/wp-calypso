import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
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
import SiteStatusContent from '../site-status-content';
import type { SiteData, SiteColumns } from '../types';

import './style.scss';

interface Props {
	columns: SiteColumns;
	item: SiteData;
	setExpanded: () => void;
	isExpanded: boolean;
}

export default function SiteTableRow( { columns, item, setExpanded, isExpanded }: Props ) {
	const dispatch = useDispatch();

	const site = item.site;
	const blogId = site.value.blog_id;
	const isConnectionHealthy = site.value?.is_connection_healthy;
	const siteError = site.error || item.monitor.error;
	const isFavorite = item.isFavorite;

	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );
	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	const { data } = useFetchTestConnection( isPartnerOAuthTokenLoaded, isConnectionHealthy, blogId );

	const isSiteConnected = data ? data.connected : true;

	const currentSiteHasSelectedLicenses =
		selectedLicensesSiteId === blogId && selectedLicenses?.length;

	// We should disable the license selection for all sites, but the active one.
	const shouldDisableLicenseSelection =
		selectedLicenses?.length && ! currentSiteHasSelectedLicenses;

	const hasSiteError = site.error || ! isSiteConnected;

	const isExpandedContentEnabled = isEnabled( 'jetpack/pro-dashboard-expandable-block' );

	const isExpandedBlockEnabled = isEnabled( 'jetpack/pro-dashboard-expandable-block' );

	return (
		<Fragment>
			<tr
				className={ classNames( 'site-table__table-row', {
					'site-table__table-row-disabled': shouldDisableLicenseSelection,
					'site-table__table-row-active': currentSiteHasSelectedLicenses,
					'site-table__table-row-site-error': hasSiteError,
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
					if ( hasSiteError && column.key !== 'site' ) {
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
								/>
							</td>
						);
					}
				} ) }
				{ /* Show error content when there is a site error */ }
				{ hasSiteError && (
					<td
						className={ classNames( 'site-table__error', {
							'site-table__td-without-border-bottom': isExpanded,
							'padding-0': isExpandedContentEnabled,
						} ) }
						// If there is an error, we need to span the whole row because we don't show any column.
						colSpan={ columns.length - 1 }
					>
						<SiteErrorContent siteUrl={ site.value.url } />
					</td>
				) }
				<td
					className={ classNames( 'site-table__actions', {
						'site-table__td-without-border-bottom': isExpanded,
						'site-table__actions-button': isExpandedBlockEnabled,
					} ) }
					// If there is an error, we need to span the whole row because we don't show the expand buttons.
					colSpan={ hasSiteError && isExpandedContentEnabled ? 2 : 1 }
				>
					<SiteActions isLargeScreen site={ site } siteError={ siteError } />
				</td>
				{ /* Show expand buttons only when the feature is enabled and there is no site error. */ }
				{ ! hasSiteError && isExpandedContentEnabled && (
					<td
						className={ classNames( 'site-table__actions site-table__expand-row', {
							'site-table__td-without-border-bottom': isExpanded,
						} ) }
					>
						<Button className="site-table__expandable-button" borderless onClick={ setExpanded }>
							<Icon icon={ isExpanded ? chevronUp : chevronDown } />
						</Button>
					</td>
				) }
			</tr>
			{ /* Show expanded content when expandable block is enabled. */ }
			{ isExpanded && (
				<tr className="site-table__table-row-expanded">
					<td colSpan={ Object.keys( item ).length + 1 }>
						<SiteExpandedContent site={ site.value } />
					</td>
				</tr>
			) }
		</Fragment>
	);
}
