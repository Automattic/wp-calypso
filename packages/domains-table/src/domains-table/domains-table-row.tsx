import { LoadingPlaceholder } from '@automattic/components';
import {
	DomainUpdateStatus,
	PartialDomainData,
	SiteDomainsQueryFnData,
} from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { PrimaryDomainLabel } from '../primary-domain-label';
import { useDomainRow } from '../use-domain-row';
import { getDomainTypeText } from '../utils/get-domain-type-text';
import { domainManagementLink } from '../utils/paths';
import { DomainStatusPurchaseActions } from '../utils/resolve-domain-status';
import { DomainsTableRegisteredUntilCell } from './domains-table-registered-until-cell';
import { DomainsTableRowActions } from './domains-table-row-actions';
import { DomainsTableSiteCell } from './domains-table-site-cell';
import { DomainsTableStatusCell } from './domains-table-status-cell';

interface DomainsTableRowProps {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	isSelected: boolean;
	hideOwnerColumn?: boolean;
	onSelect( domain: PartialDomainData ): void;
	domainStatusPurchaseActions?: DomainStatusPurchaseActions;
	onDomainsRequiringAttentionChange?( domainsRequiringAttention: number ): void;
	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	fetchSite?: ( siteIdOrSlug: number | string | null | undefined ) => Promise< SiteDetails >;
	pendingUpdates: DomainUpdateStatus[];
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
				{ ! domain.wpcom_domain && (
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
			<td>
				{ ! shouldDisplayPrimaryDomainLabel && <PrimaryDomainLabel /> }
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
			{ ! hideOwnerColumn && <td>{ renderOwnerCell() }</td> }
			<td>{ renderSiteCell() }</td>
			<td>
				<DomainsTableRegisteredUntilCell domain={ domain } />
			</td>
			<td>
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
			<td></td>
			<td className="domains-table-row__actions">
				<DomainsTableRowActions
					canConnectDomainToASite={ userCanAddSiteToDomain }
					siteSlug={ siteSlug }
					domainName={ domain.domain }
				/>
			</td>
		</tr>
	);
}
