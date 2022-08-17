import { FilterableSiteLaunchStatuses, useSitesTableFiltering } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { removeQueryArgs, addQueryArgs } from '@wordpress/url';
import page from 'page';
import { ComponentPropsWithoutRef } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { SitesDisplayModeSwitcher } from './sites-display-mode-switcher';
import { SitesSearch } from './sites-search';
import { SitesSearchIcon } from './sites-search-icon';

export interface SitesDashboardQueryParams {
	search?: string;
	showHidden: boolean;
	status: FilterableSiteLaunchStatuses;
}

const FilterBar = styled.div( {
	display: 'flex',
	alignItems: 'center',
	gap: '16px',
	padding: '32px 0',

	flexDirection: 'column',

	'@media screen and (min-width: 660px)': {
		flexDirection: 'row',
	},
} );

const DisplayControls = styled.div( {
	gap: '16px',
	display: 'flex',
	alignItems: 'center',
	alignSelf: 'stretch',
	flex: 1,
} );

const ControlsSelectDropdown = styled( SelectDropdown )( {
	width: '100%',

	'.select-dropdown__container': {
		width: '100%',

		'@media screen and (min-width: 660px)': {
			width: 'auto',
		},
	},
} );

type Statuses = ReturnType< typeof useSitesTableFiltering >[ 'statuses' ];

type SitesContentControlsProps = {
	initialSearch?: string;
	statuses: Statuses;
	selectedStatus: Statuses[ number ];
	includeHiddenOnSiteCount: boolean;
} & ComponentPropsWithoutRef< typeof SitesDisplayModeSwitcher >;

export const SitesContentControls = ( {
	initialSearch,
	statuses,
	selectedStatus,
	displayMode,
	onDisplayModeChange,
	includeHiddenOnSiteCount,
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
			<DisplayControls>
				<ControlsSelectDropdown selectedText={ selectedStatus.title }>
					{ statuses.map( ( { name, title, visibleCount, hiddenCount } ) => (
						<SelectDropdown.Item
							key={ name }
							selected={ name === selectedStatus.name }
							count={ includeHiddenOnSiteCount ? visibleCount + hiddenCount : visibleCount }
							onClick={ () => handleQueryParamChange( 'status', 'all' !== name ? name : '' ) }
						>
							{ title }
						</SelectDropdown.Item>
					) ) }
				</ControlsSelectDropdown>
				<SitesDisplayModeSwitcher
					displayMode={ displayMode }
					onDisplayModeChange={ onDisplayModeChange }
				/>
			</DisplayControls>
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
