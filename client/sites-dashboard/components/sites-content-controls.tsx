import { useSitesTableFiltering } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { removeQueryArgs, addQueryArgs } from '@wordpress/url';
import page from 'page';
import SelectDropdown from 'calypso/components/select-dropdown';
import { SitesDisplayModeSwitcher } from './sites-display-mode-switcher';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';

export interface SitesDashboardQueryParams {
	status?: string;
	search?: string;
}

const FilterBar = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 32px 0;
`;

type Statuses = ReturnType< typeof useSitesTableFiltering >[ 'statuses' ];

interface SitesContentControlsProps {
	initialSearch?: string;
	statuses: Statuses;
	selectedStatus: Statuses[ number ];
}

export const SitesContentControls = ( {
	initialSearch,
	statuses,
	selectedStatus,
}: SitesContentControlsProps ) => {
	const { __ } = useI18n();

	return (
		<FilterBar>
			<SitesSearch
				searchIcon={ <SitesSearchIcon /> }
				onSearch={ ( term ) => handleQueryParamChange( 'search', term?.trim() ) }
				isReskinned
				placeholder={ __( 'Search by name or domain…' ) }
				disableAutocorrect={ true }
				defaultValue={ initialSearch }
			/>
			<SelectDropdown selectedText={ selectedStatus.title }>
				{ statuses.map( ( { name, title, count } ) => (
					<SelectDropdown.Item
						key={ name }
						selected={ name === selectedStatus.name }
						count={ count }
						onClick={ () => handleQueryParamChange( 'status', 'all' !== name ? name : '' ) }
					>
						{ title }
					</SelectDropdown.Item>
				) ) }
			</SelectDropdown>
			<SitesDisplayModeSwitcher />
		</FilterBar>
	);
};

/**
 * Updates a query param used by the sites dashboard, causing a page navigation.
 * Param will be removed if it is empty or matches its default value.
 *
 * @param paramName name of the param being updated
 * @param paramValue new value for the param
 */
function handleQueryParamChange(
	paramName: keyof SitesDashboardQueryParams,
	paramValue: string | null
) {
	// Ensure we keep existing query params by appending `.search`
	const pathWithQuery = window.location.pathname + window.location.search;

	if ( paramValue ) {
		page.replace( addQueryArgs( pathWithQuery, { [ paramName ]: paramValue } ) );
	} else {
		page.replace( removeQueryArgs( pathWithQuery, paramName ) );
	}
}
