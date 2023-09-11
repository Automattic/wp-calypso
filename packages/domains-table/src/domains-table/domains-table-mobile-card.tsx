import { PartialDomainData } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { PrimaryDomainLabel } from '../primary-domain-label/index';
import { useDomainRow } from '../use-domain-row';
import { DomainsTableRegisteredUntilCell } from './domains-table-registered-until-cell';
import { DomainsTableRowActions } from './domains-table-row-actions';
import { DomainsTableStatusCell } from './domains-table-status-cell';

type Props = {
	domain: PartialDomainData;
};

export const DomainsTableMobileCard = ( { domain }: Props ) => {
	const { __ } = useI18n();

	const {
		ref,
		siteSlug,
		currentDomainData,
		userCanAddSiteToDomain,
		isSelected,
		handleSelectDomain,
		domainStatusPurchaseActions,
		pendingUpdates,
		shouldDisplayPrimaryDomainLabel,
	} = useDomainRow( domain );

	return (
		<div className="domains-table-mobile-card" ref={ ref }>
			<div>
				<div className="domains-table-mobile-card-header">
					{ ! domain.wpcom_domain && (
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
					<DomainsTableRowActions
						canConnectDomainToASite={ userCanAddSiteToDomain }
						siteSlug={ siteSlug }
						domainName={ domain.domain }
					/>
				</div>
			</div>

			<div>
				<span className="domains-table-mobile-card-label"> Expires / renews on </span>
				<span className="domains-table-mobile-card-registered-date">
					<DomainsTableRegisteredUntilCell domain={ domain } />
				</span>
			</div>

			<div>
				<span className="domains-table-mobile-card-label"> Status </span>
				<DomainsTableStatusCell
					siteSlug={ siteSlug }
					currentDomainData={ currentDomainData }
					domainStatusPurchaseActions={ domainStatusPurchaseActions }
					pendingUpdates={ pendingUpdates }
				/>
			</div>
		</div>
	);
};
