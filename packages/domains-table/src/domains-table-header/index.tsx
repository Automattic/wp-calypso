import { Button } from '@automattic/components';
import { DomainData } from '@automattic/data-stores';
import { CheckboxControl, Icon } from '@wordpress/components';
import { chevronDown, chevronUp } from '@wordpress/icons';
import classNames from 'classnames';
import './style.scss';

export type DomainsTableBulkSelectionStatus = 'no-domains' | 'some-domains' | 'all-domains';

export type DomainsTableColumn =
	| {
			name: string;
			label: string;
			isSortable: true;
			initialSortDirection: 'asc' | 'desc';
			supportsOrderSwitching?: boolean;
			sortFunctions?: [ ( first: DomainData, second: DomainData, sortOrder: number ) => number ];
			headerComponent?: React.ReactNode;
	  }
	| {
			name: string;
			label: string;
			isSortable?: false;
			initialSortDirection?: never;
			supportsOrderSwitching?: never;
			sortFunctions?: [ ( first: DomainData, second: DomainData, sortOrder: number ) => number ];
			headerComponent?: React.ReactNode;
	  };

type DomainsTableHeaderProps = {
	columns: DomainsTableColumn[];
	activeSortKey: string;
	activeSortDirection: 'asc' | 'desc';
	onChangeSortOrder: ( selectedColumn: DomainsTableColumn ) => void;
	bulkSelectionStatus: DomainsTableBulkSelectionStatus;
	onBulkSelectionChange(): void;
	headerClasses?: string;
};

export const DomainsTableHeader = ( {
	columns,
	activeSortKey,
	activeSortDirection,
	bulkSelectionStatus,
	onBulkSelectionChange,
	onChangeSortOrder,
	headerClasses,
}: DomainsTableHeaderProps ) => {
	const listHeaderClasses = classNames(
		'domains-table-header',
		'domains-table-header__desktop',
		headerClasses
	);

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
					<CheckboxControl
						__nextHasNoMarginBottom
						onChange={ onBulkSelectionChange }
						indeterminate={ bulkSelectionStatus === 'some-domains' }
						checked={ bulkSelectionStatus === 'all-domains' }
					/>
				</th>
				{ columns.map( ( column ) => (
					<th key={ column.name }>
						<Button
							plain
							onClick={ () => onChangeSortOrder( column ) }
							className={ classNames( 'list__header-column', {
								'is-sortable': column?.isSortable,
							} ) }
							tabIndex={ column?.isSortable ? 0 : -1 }
						>
							{ column?.headerComponent || column?.label }
							{ renderSortIcon( column, activeSortKey, activeSortDirection ) }
						</Button>
					</th>
				) ) }
			</tr>
		</thead>
	);
};
