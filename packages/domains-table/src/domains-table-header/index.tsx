import { Button } from '@automattic/components';
import { DomainData, SiteDetails } from '@automattic/data-stores';
import { CheckboxControl, Icon } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { CSSProperties, ReactNode } from 'react';

import './style.scss';

export type DomainsTableBulkSelectionStatus = 'no-domains' | 'some-domains' | 'all-domains';

export type DomainsTableColumn =
	| {
			name: string;
			label: string | ( ( count: number ) => string ) | null;
			sortLabel?: string;
			isSortable: true;
			initialSortDirection: 'asc' | 'desc';
			supportsOrderSwitching?: boolean;
			sortFunctions?: Array<
				(
					first: DomainData,
					second: DomainData,
					sortOrder: number,
					sites?: SiteDetails[]
				) => number
			>;
			headerComponent?: ReactNode;
			width?: CSSProperties[ 'width' ];
	  }
	| {
			name: string;
			label: string | ( ( count: number ) => string ) | null;
			sortLabel?: string;
			isSortable?: false;
			initialSortDirection?: never;
			supportsOrderSwitching?: never;
			sortFunctions?: [
				(
					first: DomainData,
					second: DomainData,
					sortOrder: number,
					sites?: SiteDetails[]
				) => number
			];
			headerComponent?: ReactNode;
			width?: CSSProperties[ 'width' ];
	  };

type DomainsTableHeaderProps = {
	columns: DomainsTableColumn[];
	activeSortKey: string;
	activeSortDirection: 'asc' | 'desc';
	onChangeSortOrder: ( selectedColumn: DomainsTableColumn ) => void;
	bulkSelectionStatus: DomainsTableBulkSelectionStatus;
	onBulkSelectionChange(): void;
	domainCount: number;
	headerClasses?: string;
	hideOwnerColumn?: boolean;
	domainsRequiringAttention?: number;
	canSelectAnyDomains?: boolean;
	isAllSitesView?: boolean;
};

export const DomainsTableHeader = ( {
	columns,
	activeSortKey,
	activeSortDirection,
	bulkSelectionStatus,
	onBulkSelectionChange,
	onChangeSortOrder,
	domainCount,
	headerClasses,
	hideOwnerColumn = false,
	domainsRequiringAttention,
	canSelectAnyDomains = true,
	isAllSitesView,
}: DomainsTableHeaderProps ) => {
	const { __ } = useI18n();
	const listHeaderClasses = classNames( 'domains-table-header', headerClasses || '' );

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

	return (
		<thead className={ listHeaderClasses }>
			<tr>
				<th className="domains-table__bulk-action-container">
					{ canSelectAnyDomains && (
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
					) }
				</th>

				{ columns.map( ( column ) => {
					if ( column.name === 'owner' && hideOwnerColumn ) {
						return null;
					}
					if ( column.name === 'email' && isAllSitesView ) {
						return null;
					}
					return (
						<th key={ column.name } style={ { width: column.width } }>
							<Button
								plain
								onClick={ () => onChangeSortOrder( column ) }
								className={ classNames( 'list__header-column', {
									'is-sortable': column?.isSortable,
								} ) }
								tabIndex={ column?.isSortable ? 0 : -1 }
							>
								{ column?.headerComponent ||
									( typeof column?.label === 'function'
										? column.label( domainCount )
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
