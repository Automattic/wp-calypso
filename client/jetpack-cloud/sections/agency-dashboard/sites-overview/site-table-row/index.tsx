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
import { SiteExpandedContent } from '../site-expanded-content';
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

	const hideBorderBottom = isExpanded || site.error;
	const showSiteError = site.error || ! isSiteConnected;

	return (
		<Fragment>
			<tr
				className={ classNames( 'site-table__table-row', {
					'site-table__table-row-disabled': shouldDisableLicenseSelection,
					'site-table__table-row-active': currentSiteHasSelectedLicenses,
					'site-table__table-row-site-error': showSiteError,
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
					if ( showSiteError && column.key !== 'site' ) {
						return null;
					}
					if ( row.type ) {
						return (
							<td
								className={ classNames( column.className, {
									'site-table__td-without-border-bottom': hideBorderBottom,
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
				{ showSiteError && (
					<td className="site-table__error" colSpan={ columns.length - 1 }>
						<SiteErrorContent siteUrl={ site.value.url } />
					</td>
				) }
				<td
					className={ classNames( 'site-table__actions', {
						'site-table__td-without-border-bottom': hideBorderBottom,
					} ) }
				>
					<SiteActions isLargeScreen site={ site } siteError={ siteError } />
				</td>
				{ isEnabled( 'jetpack/pro-dashboard-expandable-block' ) && (
					<td
						className={ classNames( 'site-table__actions', {
							'site-table__td-without-border-bottom': hideBorderBottom,
						} ) }
					>
						<Button className="site-table__expandable-button" borderless onClick={ setExpanded }>
							<Icon icon={ isExpanded ? chevronUp : chevronDown } />
						</Button>
					</td>
				) }
			</tr>
			{ isExpanded && (
				<tr className="site-table__table-row-expanded">
					<td colSpan={ Object.keys( item ).length + 1 }>
						<SiteExpandedContent site={ site } />
					</td>
				</tr>
			) }
			{ site.error || ! isSiteConnected ? (
				<tr className="site-table__connection-error">
					<td colSpan={ Object.keys( item ).length + 1 }>
						<SiteErrorContent siteUrl={ site.value.url } />
					</td>
				</tr>
			) : null }
		</Fragment>
	);
}
