import { CheckboxControl } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useDomainsTable } from './domains-table';
import { DomainsTableMobileCard } from './domains-table-mobile-card';
import DomainsTableMobileCardLoading from './domains-table-mobile-card-loading';

export const DomainsTableMobileCards = () => {
	const {
		showBulkActions,
		filteredData,
		canSelectAnyDomains,
		changeBulkSelection,
		getBulkSelectionStatus,
		isLoadingDomains,
	} = useDomainsTable();

	const bulkSelectionStatus = getBulkSelectionStatus();

	return (
		<div className="domains-table-mobile-cards">
			<div className="domains-table__bulk-action-container">
				{ showBulkActions && canSelectAnyDomains && (
					<div className="domains-table-mobile-cards-select-all">
						<CheckboxControl
							data-testid="domains-select-all-checkbox"
							__nextHasNoMarginBottom
							onChange={ changeBulkSelection }
							indeterminate={ bulkSelectionStatus === 'some-domains' }
							checked={ bulkSelectionStatus === 'all-domains' }
							aria-label={ __(
								'Select all tick boxes for domains in table',
								__i18n_text_domain__
							) }
						/>
						<span>
							{ ' ' }
							{ sprintf(
								/* translators: Heading which displays the number of domains in a table */
								_n(
									'Select %(count)d domain',
									'Select all %(count)d domains',
									filteredData.length,
									__i18n_text_domain__
								),
								{ count: filteredData.length }
							) }{ ' ' }
						</span>
					</div>
				) }
			</div>
			{ isLoadingDomains && (
				<>
					<DomainsTableMobileCardLoading />
					<DomainsTableMobileCardLoading />
					<DomainsTableMobileCardLoading />
					<DomainsTableMobileCardLoading />
					<DomainsTableMobileCardLoading />
					<DomainsTableMobileCardLoading />
				</>
			) }

			{ filteredData.map( ( domain ) => (
				<DomainsTableMobileCard key={ domain.domain } domain={ domain } />
			) ) }
		</div>
	);
};
