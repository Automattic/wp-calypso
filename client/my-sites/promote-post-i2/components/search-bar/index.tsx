import { Gridicon } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import Search from 'calypso/components/search';
import SelectDropdown from 'calypso/components/select-dropdown';
import CampaignsFilter from '../campaigns-filter';

interface Props {
	mode: 'campaigns' | 'posts';
}

type SortOption = {
	label: string;
	value: string;
};

const SORT_OPTIONS_BY_TITLE = 'by_title';
const SORT_OPTIONS_LAST_PUBLISHED = 'last_published';
const SORT_OPTIONS_RECENTLY_UPDATED = 'recently_updated';
const SORT_OPTIONS_MOST_LIKED = 'most_liked';
const SORT_OPTIONS_MOST_COMMENTED = 'most_commented';
const SORT_OPTIONS_MOST_VIEWED = 'most_viewed';

const SORT_OPTIONS_DEFAULT = SORT_OPTIONS_RECENTLY_UPDATED;

export default function SearchBar( props: Props ) {
	const { mode } = props;

	const sortOptions: Array< SortOption > = [
		{
			label: translate( 'By title' ),
			value: SORT_OPTIONS_BY_TITLE,
		},
		{
			label: translate( 'Last published' ),
			value: SORT_OPTIONS_LAST_PUBLISHED,
		},
		{
			label: translate( 'Recently updated' ),
			value: SORT_OPTIONS_RECENTLY_UPDATED,
		},
		{
			label: translate( 'Most liked' ),
			value: SORT_OPTIONS_MOST_LIKED,
		},
		{
			label: translate( 'Most commented' ),
			value: SORT_OPTIONS_MOST_COMMENTED,
		},
		{
			label: translate( 'Most viewed' ),
			value: SORT_OPTIONS_MOST_VIEWED,
		},
	];

	const [ searchInput, setSearchInput ] = React.useState( '' );
	const [ currentSortOption, setSortOption ] = React.useState( SORT_OPTIONS_DEFAULT );

	const onSearch = () => {
		return;
	};

	const onClearIconClick = () => {
		setSearchInput( '' );
	};

	const onChangeFilter = () => {
		setSearchInput( '' ); // TODO: Filter by status: All | Active | In Moderation | Rejected.
	};

	function getSelectedSortOption( value: string ) {
		if ( ! value ) {
			return null;
		}

		const index = sortOptions.findIndex( ( item ) => item.value === value );
		if ( index > -1 ) {
			// translators: %s is a sort option like "Last Published"
			return sprintf( translate( 'Sort: %s' ), sortOptions[ index ].label );
		}

		return null;
	}

	return (
		<div className="promote-post-i2__search-bar-wrapper">
			<Search
				className="promote-post-i2__search-bar-search"
				initialValue={ searchInput }
				value={ searchInput }
				placeholder={ translate( 'Search…' ) }
				onSearch={ onSearch }
				onSearchChange={ ( inputValue: string ) => {
					// findTextForSuggestions( inputValue );
					setSearchInput( inputValue );
					// setIsApplySearch( false );
				} }
			>
				{ searchInput !== '' && (
					<div className="search-themes-card__icon">
						<Gridicon
							icon="cross"
							className="search-themes-card__icon-close"
							tabIndex={ 0 }
							aria-controls="search-component-search-themes"
							aria-label={ translate( 'Clear Search' ) }
							onClick={ onClearIconClick }
						/>
					</div>
				) }
			</Search>

			{ mode === 'posts' && (
				<SelectDropdown
					className="promote-post-i2__search-bar-dropdown"
					onSelect={ ( option: SortOption ) => setSortOption( option.value ) }
					options={ sortOptions }
					selectedText={ getSelectedSortOption( currentSortOption ) }
				/>
			) }

			{ mode === 'campaigns' && (
				<CampaignsFilter handleChangeFilter={ onChangeFilter } campaignsFilter="all" />
			) }
		</div>
	);
}
