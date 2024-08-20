import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { PartialDomainData } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { PrimaryDomainLabel } from '../primary-domain-label';
import { useDomainRow } from '../use-domain-row';
import { canBulkUpdate } from '../utils/can-bulk-update';
import { domainInfoContext } from '../utils/constants';
import { getDomainTypeText } from '../utils/get-domain-type-text';
import { domainManagementLink as getDomainManagementLink } from '../utils/paths';
import { useDomainsTable } from './domains-table';
import { DomainsTableEmailIndicator } from './domains-table-email-indicator';
import { DomainsTableExpiresRenewsOnCell } from './domains-table-expires-renews-cell';
import { DomainsTablePlaceholder } from './domains-table-placeholder';
import { DomainsTableRowActions } from './domains-table-row-actions';
import { DomainsTableSiteCell } from './domains-table-site-cell';
import DomainsTableSSLCell from './domains-table-ssl-cell';
import { DomainsTableStatusCell } from './domains-table-status-cell';
import { DomainsTableStatusCTA } from './domains-table-status-cta';
import type { MouseEvent } from 'react';

interface DomainsTableRowProps {
	domain: PartialDomainData;
}

export function DomainsTableRow( { domain }: DomainsTableRowProps ) {
	const { __ } = useI18n();

	const {
		ref,
		site,
		siteSlug,
		isLoadingRowDetails,
		placeholderWidth,
		currentDomainData,
		userCanAddSiteToDomain,
		shouldDisplayPrimaryDomainLabel,
		isManageableDomain,
		isLoadingSiteDetails,
		isLoadingSiteDomainsDetails,
		isSelected,
		handleSelectDomain,
		isAllSitesView,
		domainStatus,
		pendingUpdates,
		sslStatus,
		hasWpcomManagedSslCert,
	} = useDomainRow( domain );
	const { canSelectAnyDomains, domainsTableColumns, isCompact } = useDomainsTable();

	const renderSiteCell = () => {
		if ( site && currentDomainData ) {
			return (
				<DomainsTableSiteCell
					site={ site }
					siteSlug={ siteSlug }
					userCanAddSiteToDomain={ userCanAddSiteToDomain }
				/>
			);
		}

		if ( isLoadingRowDetails ) {
			return <DomainsTablePlaceholder style={ { width: `${ placeholderWidth }%` } } />;
		}

		return null;
	};

	const domainTypeText =
		currentDomainData && getDomainTypeText( currentDomainData, __, domainInfoContext.DOMAIN_ROW );

	const domainManagementLink = isManageableDomain
		? getDomainManagementLink( domain, siteSlug, isAllSitesView )
		: '';

	const renderOwnerCell = () => {
		if ( isLoadingSiteDetails || isLoadingSiteDomainsDetails ) {
			return <DomainsTablePlaceholder style={ { width: `${ placeholderWidth }%` } } />;
		}

		if ( ! currentDomainData?.owner ) {
			return '-';
		}

		// Removes the username that appears in parentheses after the owner's name.
		// Uses $ and the negative lookahead assertion (?!.*\() to ensure we only match the very last parenthetical.
		return currentDomainData.owner.replace( / \((?!.*\().+\)$/, '' );
	};

	const handleSelect = () => {
		window.location.href = domainManagementLink;
	};

	return (
		<tr
			key={ domain.domain }
			className="domains-table__row"
			onClick={ domainManagementLink ? handleSelect : undefined }
		>
			{ canSelectAnyDomains && (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
				<td
					className="domains-table-checkbox-td"
					onClick={ ( e: MouseEvent ) => e.stopPropagation() }
				>
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ isSelected }
						onChange={ () => handleSelectDomain( domain ) }
						/* translators: Label for a checkbox control that selects a domain name.*/
						aria-label={ sprintf( __( 'Tick box for %(domain)s', __i18n_text_domain__ ), {
							domain: domain.domain,
						} ) }
						disabled={ ! canBulkUpdate( domain ) }
					/>
				</td>
			) }

			{ domainsTableColumns.map( ( column ) => {
				if ( column.name === 'domain' ) {
					return (
						// The in-view ref is attached to the domain cell because the <tr> is display:contents, which appears to break the in-view logic
						<td
							key={ domain.domain + column.name }
							className="domains-table-row__domain"
							ref={ ref }
						>
							{ shouldDisplayPrimaryDomainLabel && <PrimaryDomainLabel /> }
							{ domainManagementLink ? (
								<a
									className="domains-table__domain-name"
									href={ domainManagementLink }
									onClick={ ( e: MouseEvent ) => e.stopPropagation() }
								>
									{ domain.domain }
								</a>
							) : (
								<span className="domains-table__domain-name">{ domain.domain }</span>
							) }

							{ isCompact && <div>{ renderSiteCell() }</div> }

							{ domainTypeText && (
								<span className="domains-table-row__domain-type-text">{ domainTypeText }</span>
							) }
						</td>
					);
				}

				if ( column.name === 'owner' ) {
					return <td key={ domain.domain + column.name }>{ renderOwnerCell() }</td>;
				}

				if ( column.name === 'site' ) {
					return <td key={ domain.domain + column.name }>{ renderSiteCell() }</td>;
				}

				if ( column.name === 'expire_renew' ) {
					return (
						<DomainsTableExpiresRenewsOnCell
							key={ domain.domain + column.name }
							as="td"
							domain={ domain }
							isCompact={ isCompact }
						/>
					);
				}

				if ( column.name === 'status' ) {
					return isLoadingRowDetails ? (
						<td key={ domain.domain + column.name }>
							<DomainsTablePlaceholder style={ { width: `${ placeholderWidth }%` } } />
						</td>
					) : (
						<DomainsTableStatusCell
							key={ domain.domain + column.name }
							as="td"
							domainStatus={ domainStatus }
							pendingUpdates={ pendingUpdates }
						/>
					);
				}

				if ( column.name === 'status_action' ) {
					return (
						<td key={ domain.domain + column.name }>
							{ ! domainStatus?.callToAction || isLoadingRowDetails ? null : (
								<DomainsTableStatusCTA callToAction={ domainStatus.callToAction } />
							) }
						</td>
					);
				}

				if ( column.name === 'email' ) {
					return (
						<td key={ domain.domain + column.name }>
							<DomainsTableEmailIndicator domain={ domain } siteSlug={ siteSlug } />
						</td>
					);
				}

				if ( column.name === 'ssl' ) {
					return (
						<DomainsTableSSLCell
							key={ domain.domain + column.name }
							domainManagementLink={ domainManagementLink }
							sslStatus={ sslStatus }
							hasWpcomManagedSslCert={ hasWpcomManagedSslCert }
						/>
					);
				}

				if ( column.name === 'action' ) {
					return (
						// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
						<td
							key={ domain.domain + column.name }
							className="domains-table-row__actions"
							onClick={ ( e: MouseEvent ) => e.stopPropagation() }
						>
							{ currentDomainData && (
								<DomainsTableRowActions
									siteSlug={ siteSlug }
									domain={ currentDomainData }
									isAllSitesView={ isAllSitesView }
									canSetPrimaryDomainForSite={
										site?.plan?.features.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ??
										false
									}
									isSiteOnFreePlan={ site?.plan?.is_free ?? true }
									isSimpleSite={ ! site?.is_wpcom_atomic }
								/>
							) }
						</td>
					);
				}

				throw new Error( `untreated cell: ${ column.name }` );
			} ) }
		</tr>
	);
}
