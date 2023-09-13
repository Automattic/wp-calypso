import { CheckboxControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainsTable } from './domains-table';
import { DomainsTableMobileCard } from './domains-table-mobile-card';

export const DomainsTableMobileCards = () => {
	const { __ } = useI18n();

	const {
		showBulkActions,
		filteredData,
		canSelectAnyDomains,
		changeBulkSelection,
		getBulkSelectionStatus,
	} = useDomainsTable();

	const bulkSelectionStatus = getBulkSelectionStatus();

	return (
		<div className="domains-table-mobile-cards">
			<div className="domains-table__bulk-action-container">
				{ showBulkActions && canSelectAnyDomains && (
					<CheckboxControl
						data-testid="domains-select-all-checkbox"
						__nextHasNoMarginBottom
						onChange={ changeBulkSelection }
						indeterminate={ bulkSelectionStatus === 'some-domains' }
						checked={ bulkSelectionStatus === 'all-domains' }
						aria-label={ __( 'Select all tick boxes for domains in table', __i18n_text_domain__ ) }
					/>
				) }
			</div>
			{ filteredData.map( ( domain ) => (
				<DomainsTableMobileCard key={ domain.domain } domain={ domain } />
			) ) }
		</div>
	);
};
