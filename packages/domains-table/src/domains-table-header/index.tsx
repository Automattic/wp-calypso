import { Button } from '@automattic/components';
import { DomainData, SiteDetails } from '@automattic/data-stores';
import { CheckboxControl, Icon } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import DomainsTableHeaderLoading from './header-loading';
import type { ReactNode } from 'react';

import './style.scss';

export type DomainsTableBulkSelectionStatus = 'no-domains' | 'some-domains' | 'all-domains';

interface BaseDomainsTableColumn {
	name: string;
	label:
		| string
		| ( ( count: number, isBulkSelection: boolean, showCount?: boolean ) => string )
		| null;
	sortFunctions?: Array<
		( first: DomainData, second: DomainData, sortOrder: number, sites?: SiteDetails[] ) => number
	>;
	headerComponent?: ReactNode;
	className?: string;
}

export type DomainsTableColumn = BaseDomainsTableColumn &
	(
		| {
				isSortable: true;
				sortLabel?: string;
				initialSortDirection: 'asc' | 'desc';
				supportsOrderSwitching?: boolean;
		  }
		| {
				isSortable?: false;
				initialSortDirection?: never;
				supportsOrderSwitching?: never;
		  }
	);

type DomainsTableHeaderProps = {
	columns: DomainsTableColumn[];
	activeSortKey: string;
	activeSortDirection: 'asc' | 'desc';
	onChangeSortOrder: ( selectedColumn: DomainsTableColumn ) => void;
	bulkSelectionStatus: DomainsTableBulkSelectionStatus;
	onBulkSelectionChange(): void;
	domainCount: number;
	selectedDomainsCount: number;
	headerClasses?: string;
	domainsRequiringAttention?: number;
	canSelectAnyDomains?: boolean;
	isLoadingDomains?: boolean;
};

export const DomainsTableHeader = ( {
	columns,
	activeSortKey,
	activeSortDirection,
	bulkSelectionStatus,
	onBulkSelectionChange,
	onChangeSortOrder,
	domainCount,
	selectedDomainsCount,
	headerClasses,
	domainsRequiringAttention,
	canSelectAnyDomains = true,
	isLoadingDomains,
}: DomainsTableHeaderProps ) => {
	const { __ } = useI18n();
	const listHeaderClasses = clsx( 'domains-table-header', headerClasses || '' );

	const renderSortIcon = (
		column: DomainsTableColumn,
		sortKey: string,
		activeSortDirection: string
	) => {
		if ( ! column?.isSortable ) {
			return null;
		}

		const isActiveColumn = sortKey === column.name;
		const columnSortOrder = isActiveColumn ? activeSortDirection : column.initialSortDirection;

		return <Icon icon={ columnSortOrder === 'asc' ? chevronDown : chevronUp } size={ 16 } />;
	};

	const isBulkSelection = bulkSelectionStatus !== 'no-domains';

	if ( isLoadingDomains ) {
		return (
			<thead className={ listHeaderClasses }>
				<DomainsTableHeaderLoading />
			</thead>
		);
	}

	return (
		<thead className={ listHeaderClasses }>
			<tr>
				{ canSelectAnyDomains && (
					<th className="domains-table-checkbox-th">
						<CheckboxControl
							data-testid="domains-select-all-checkbox"
							__nextHasNoMarginBottom
							onChange={ onBulkSelectionChange }
							indeterminate={ bulkSelectionStatus === 'some-domains' }
							checked={ bulkSelectionStatus === 'all-domains' }
							aria-label={ __(
								'Select all tick boxes for domains in table',
								__i18n_text_domain__
							) }
						/>
					</th>
				) }

				{ columns.map( ( column ) => {
					return (
						<th key={ column.name } className={ column.className }>
							<Button
								plain
								onClick={ () => onChangeSortOrder( column ) }
								className={ clsx( 'list__header-column', {
									'is-sortable': column?.isSortable,
								} ) }
								tabIndex={ column?.isSortable ? 0 : -1 }
							>
								{ column?.headerComponent ||
									( typeof column?.label === 'function'
										? column.label(
												isBulkSelection ? selectedDomainsCount : domainCount,
												isBulkSelection,
												canSelectAnyDomains
										  )
										: column?.label ) }
								{ column?.name === 'status' && domainsRequiringAttention && (
									<span className="list-status-cell__bubble">{ domainsRequiringAttention }</span>
								) }
								{ renderSortIcon( column, activeSortKey, activeSortDirection ) }
							</Button>
						</th>
					);
				} ) }
			</tr>
		</thead>
	);
};
