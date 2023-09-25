import { FEATURE_SET_PRIMARY_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import { LoadingPlaceholder } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { PrimaryDomainLabel } from '../primary-domain-label/index';
import { useDomainRow } from '../use-domain-row';
import { canBulkUpdate } from '../utils/can-bulk-update';
import { DomainsTableEmailIndicator } from './domains-table-email-indicator';
import { DomainsTableExpiresRewnewsOnCell } from './domains-table-expires-renew-cell';
import { DomainsTableRowActions } from './domains-table-row-actions';
import { DomainsTableStatusCell } from './domains-table-status-cell';
import { DomainsTableStatusCTA } from './domains-table-status-cta';

type Props = {
	domain: PartialDomainData;
};

export const DomainsTableMobileCard = ( { domain }: Props ) => {
	const { __ } = useI18n();

	const {
		ref,
		site,
		siteSlug,
		currentDomainData,
		isSelected,
		handleSelectDomain,
		domainStatus,
		pendingUpdates,
		shouldDisplayPrimaryDomainLabel,
		showBulkActions,
		isLoadingSiteDomainsDetails,
		isAllSitesView,
	} = useDomainRow( domain );

	return (
		<div className="domains-table-mobile-card" ref={ ref }>
			<div>
				<div className="domains-table-mobile-card-header">
					{ canBulkUpdate( domain ) && showBulkActions && (
						<CheckboxControl
							__nextHasNoMarginBottom
							checked={ isSelected }
							onChange={ () => handleSelectDomain( domain ) }
							/* translators: Label for a checkbox control that selects a domain name.*/
							aria-label={ sprintf( __( 'Tick box for %(domain)s', __i18n_text_domain__ ), {
								domain: domain.domain,
							} ) }
							size={ 20 }
						/>
					) }
					<div>
						{ shouldDisplayPrimaryDomainLabel && <PrimaryDomainLabel /> }
						<span className="domains-table__domain-name">{ domain.domain }</span>
					</div>
				</div>

				<div>
					{ currentDomainData && (
						<DomainsTableRowActions
							siteSlug={ siteSlug }
							domain={ currentDomainData }
							isAllSitesView={ isAllSitesView }
							canSetPrimaryDomainForSite={
								site?.plan?.features.active.includes( FEATURE_SET_PRIMARY_CUSTOM_DOMAIN ) ?? false
							}
							isSiteOnFreePlan={ site?.plan?.is_free ?? true }
							isSimpleSite={ ! site?.is_wpcom_atomic }
						/>
					) }
				</div>
			</div>

			{ ! isAllSitesView && (
				<div className="domains-table-mobile-card-email">
					<span className="domains-table-mobile-card-label"> { __( 'Email' ) } </span>
					<DomainsTableEmailIndicator domain={ domain } siteSlug={ siteSlug } />
				</div>
			) }

			<div>
				<span className="domains-table-mobile-card-label"> { __( 'Expires / renews on' ) } </span>
				<span className="domains-table-mobile-card-registered-date">
					<DomainsTableExpiresRewnewsOnCell domain={ domain } as="div" />
				</span>
			</div>

			<div>
				<span className="domains-table-mobile-card-label"> { __( 'Status' ) } </span>
				{ ! currentDomainData || isLoadingSiteDomainsDetails ? (
					<LoadingPlaceholder style={ { width: '30%' } } />
				) : (
					<div className="domains-table-mobile-card-status">
						<DomainsTableStatusCell
							domainStatus={ domainStatus }
							pendingUpdates={ pendingUpdates }
							as="div"
						/>
						{ domainStatus?.callToAction && (
							<DomainsTableStatusCTA callToAction={ domainStatus.callToAction } />
						) }
					</div>
				) }
			</div>
		</div>
	);
};
