import { Gridicon, SelectDropdown } from '@automattic/components';
import SearchControl, { SearchIcon } from '@automattic/search';
import { isMobile } from '@automattic/viewport';
import { DropdownMenu, MenuGroup, MenuItem, ToggleControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainsTable } from '../domains-table/domains-table';
import { domainsTableColumns } from '../domains-table-header/columns';

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

	const { sortKey, sortDirection, onSortChange, setShowBulkActions, showBulkActions } =
		useDomainsTable();

	const options: any[] = [];
	const selected = domainsTableColumns.find( ( column ) => column.name === sortKey );
	const sortName = selected?.sortLabel || selected?.label;
	const arrow = sortDirection === 'asc' ? '↓' : '↑';
	const selectedSort = `${ sortName } ${ arrow }`;

	domainsTableColumns
		.filter( ( column ) => column.label !== null )
		.forEach( ( column ) => {
			options.push(
				<SelectDropdown.Item
					key={ `${ column.name }asc` }
					onClick={ () => onSortChange( column, 'asc' ) }
				>
					{ column?.sortLabel || column?.label } ↑
				</SelectDropdown.Item>
			);

			options.push(
				<SelectDropdown.Item
					key={ `${ column.name }desc` }
					onClick={ () => onSortChange( column, 'desc' ) }
				>
					{ column?.sortLabel || column?.label } ↓
				</SelectDropdown.Item>
			);
		} );

	const isMobileDevice = isMobile();

	return (
		<div className="domains-table-filter">
			<SearchControl
				searchIcon={ <SearchIcon /> }
				className="domains-table-filter__search"
				onSearch={ onSearch }
				defaultValue={ filter.query }
				isReskinned
				placeholder={ __( 'Search by domain…' ) }
				disableAutocorrect={ true }
			/>
			{ isMobileDevice && (
				<>
					<div className="domains-table-mobile-cards-controls">
						<SelectDropdown
							selectedText={ selectedSort }
							className="domains-table-mobile-cards-sort-dropdown"
						>
							{ options }
						</SelectDropdown>

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
					</div>
				</>
			) }
		</div>
	);
};
