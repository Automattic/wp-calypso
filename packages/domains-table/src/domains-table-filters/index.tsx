import { Gridicon, SelectDropdown } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	ToggleControl,
	SearchControl,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactNode } from 'react';
import { useDomainsTable } from '../domains-table/domains-table';
import './style.scss';

export interface DomainsTableFilter {
	query: string;
}

interface DomainsTableFiltersProps {
	onSearch( query: string ): void;

	filter: DomainsTableFilter;
}

export const DomainsTableFilters = ( { onSearch, filter }: DomainsTableFiltersProps ) => {
	const { __ } = useI18n();

	const isMobile = useMobileBreakpoint();

	const {
		sortKey,
		sortDirection,
		onSortChange,
		setShowBulkActions,
		showBulkActions,
		domainsTableColumns,
		canSelectAnyDomains,
	} = useDomainsTable();

	const options: ReactNode[] = [];
	const selected = domainsTableColumns.find( ( column ) => column.name === sortKey );
	const sortName = selected && 'sortLabel' in selected ? selected.sortLabel : selected?.label;
	const arrow = sortDirection === 'asc' ? '↓' : '↑';
	const selectedSort = `${ sortName } ${ arrow }`;

	domainsTableColumns
		.filter( ( column ) => column.label !== null )
		.forEach( ( column ) => {
			const label = 'sortLabel' in column ? column.sortLabel : column.label;

			options.push(
				<SelectDropdown.Item
					key={ `${ column.name }asc` }
					onClick={ () => onSortChange( column, 'asc' ) }
				>
					{ label } ↑
				</SelectDropdown.Item>
			);

			options.push(
				<SelectDropdown.Item
					key={ `${ column.name }desc` }
					onClick={ () => onSortChange( column, 'desc' ) }
				>
					{ label } ↓
				</SelectDropdown.Item>
			);
		} );

	return (
		<div className="domains-table-filter">
			<SearchControl
				className="domains-table-search"
				onChange={ onSearch }
				value={ filter.query }
				placeholder={ __( 'Search by domain…' ) }
				spellCheck="false"
				autoCorrect="off"
				autoComplete="off"
			/>
			{ isMobile && (
				<>
					<div className="domains-table-mobile-cards-controls">
						<SelectDropdown
							selectedText={ selectedSort }
							className="domains-table-mobile-cards-sort-dropdown"
						>
							{ options }
						</SelectDropdown>

						{ canSelectAnyDomains && (
							<DropdownMenu icon={ <Gridicon icon="ellipsis" /> } label={ __( 'Domain actions' ) }>
								{ () => (
									<MenuGroup>
										<MenuItem
											onClick={ () => setShowBulkActions( ! showBulkActions ) }
											className="domains-table-mobile-cards-controls-bulk-toggle"
										>
											<ToggleControl
												label={ __( 'Bulk actions ' ) }
												onChange={ () => setShowBulkActions( ! showBulkActions ) }
												checked={ showBulkActions }
											/>
										</MenuItem>
									</MenuGroup>
								) }
							</DropdownMenu>
						) }
					</div>
				</>
			) }
		</div>
	);
};
