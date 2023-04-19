import { sprintf } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import Gridicon from 'calypso/../packages/components/src/gridicon';
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

export default function SearchBar( props: Props ) {
	const { mode } = props;

	const sortOptions: Array< SortOption > = [
		{
			label: translate( 'Last published' ),
			value: 'last_published',
		},
		// { // TODO: Add the rest of sorting option after asking Bart
		// 	label: translate( 'Most viewed' ),
		// 	value: 'most_viewed',
		// },
	];

	const [ searchInput, setSearchInput ] = React.useState( '' );
	const [ currentSortOption, setSortOption ] = React.useState( sortOptions[ 0 ].value );

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
		<div className="promote-post__search-bar-wrapper">
			<Search
				className="promote-post__search-bar-search"
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
					className="promote-post__search-bar-dropdown"
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
