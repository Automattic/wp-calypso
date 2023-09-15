import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { LoadingPlaceholder } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { PrimaryDomainLabel } from '../primary-domain-label';
import { useDomainRow } from '../use-domain-row';
import { domainInfoContext } from '../utils/constants';
import { getDomainTypeText } from '../utils/get-domain-type-text';
import { domainManagementLink } from '../utils/paths';
import { useDomainsTable } from './domains-table';
import { DomainsTableEmailIndicator } from './domains-table-email-indicator';
import { DomainsTableRegisteredUntilCell } from './domains-table-registered-until-cell';
import { DomainsTableRowActions } from './domains-table-row-actions';
import { DomainsTableSiteCell } from './domains-table-site-cell';
import { DomainsTableStatusCell } from './domains-table-status-cell';

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
		hideOwnerColumn,
		domainStatusPurchaseActions,
		pendingUpdates,
	} = useDomainRow( domain );
	const { canSelectAnyDomains, domainsTableColumns } = useDomainsTable();

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
			return <LoadingPlaceholder style={ { width: `${ placeholderWidth }%` } } />;
		}

		return null;
	};

	const domainTypeText =
		currentDomainData && getDomainTypeText( currentDomainData, __, domainInfoContext.DOMAIN_ROW );

	const renderOwnerCell = () => {
		if ( isLoadingSiteDetails || isLoadingSiteDomainsDetails ) {
			return <LoadingPlaceholder style={ { width: `${ placeholderWidth }%` } } />;
		}

		if ( ! currentDomainData?.owner ) {
			return '-';
		}

		// Removes the username that appears in parentheses after the owner's name.
		// Uses $ and the negative lookahead assertion (?!.*\() to ensure we only match the very last parenthetical.
		return currentDomainData.owner.replace( / \((?!.*\().+\)$/, '' );
	};

	return (
		<tr key={ domain.domain } ref={ ref }>
			<td>
				{ canSelectAnyDomains && ! domain.wpcom_domain && (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ isSelected }
						onChange={ () => handleSelectDomain( domain ) }
						/* translators: Label for a checkbox control that selects a domain name.*/
						aria-label={ sprintf( __( 'Tick box for %(domain)s', __i18n_text_domain__ ), {
							domain: domain.domain,
						} ) }
					/>
				) }
			</td>
			{ domainsTableColumns.map( ( column ) => {
				if ( column.name === 'domain' ) {
					return (
						<td key={ column.name }>
							{ shouldDisplayPrimaryDomainLabel && <PrimaryDomainLabel /> }
							{ isManageableDomain ? (
								<a
									className="domains-table__domain-name"
									href={ domainManagementLink( domain, siteSlug, isAllSitesView ) }
								>
									{ domain.domain }
								</a>
							) : (
								<span className="domains-table__domain-name">{ domain.domain }</span>
							) }
							{ domainTypeText && (
								<span className="domains-table-row__domain-type-text">{ domainTypeText }</span>
							) }
						</td>
					);
				}

				if ( column.name === 'owner' ) {
					if ( ! hideOwnerColumn ) {
						return <td key={ column.name }>{ renderOwnerCell() }</td>;
					}

					return null;
				}

				if ( column.name === 'site' ) {
					return <td key={ column.name }>{ renderSiteCell() }</td>;
				}

				if ( column.name === 'expire_renew' ) {
					return (
						<td key={ column.name }>
							<DomainsTableRegisteredUntilCell domain={ domain } />
						</td>
					);
				}

				if ( column.name === 'status' ) {
					return (
						<td key={ column.name }>
							{ isLoadingRowDetails ? (
								<LoadingPlaceholder style={ { width: `${ placeholderWidth }%` } } />
							) : (
								<DomainsTableStatusCell
									siteSlug={ siteSlug }
									currentDomainData={ currentDomainData }
									domainStatusPurchaseActions={ domainStatusPurchaseActions }
									pendingUpdates={ pendingUpdates }
								/>
							) }
						</td>
					);
				}

				if ( column.name === 'email' ) {
					return (
						<td>
							{ domain.current_user_can_add_email && (
								<DomainsTableEmailIndicator domain={ domain } siteSlug={ siteSlug } />
							) }
						</td>
					);
				}

				if ( column.name === 'action' ) {
					return (
						<td key={ column.name } className="domains-table-row__actions">
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
