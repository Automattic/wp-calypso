import Search, { SearchIcon } from '@automattic/search';
import { translate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import './style.scss';
import SelectDropdown from 'calypso/components/select-dropdown';
import CampaignsFilter, { CampaignsFilterType } from '../campaigns-filter';

export type SearchOptions = {
	search?: string;
	filter?: {
		status?: string;
		postType?: string;
	};
	order?: {
		orderBy: string;
		order: string;
	};
};

interface Props {
	mode: 'campaigns' | 'posts';
	handleSetSearch: ( search: SearchOptions ) => void;
}

type DropdownOption = {
	label: string;
	value: string;
};

const SORT_OPTIONS_BY_TITLE = 'post_title';
const SORT_OPTIONS_LAST_PUBLISHED = 'date';
const SORT_OPTIONS_RECENTLY_UPDATED = 'modified';
const SORT_OPTIONS_MOST_LIKED = 'like_count';
const SORT_OPTIONS_MOST_COMMENTED = 'comment_count';
const SORT_OPTIONS_MOST_VIEWED = 'monthly_view_count';

export const SORT_OPTIONS_DEFAULT = {
	orderBy: SORT_OPTIONS_RECENTLY_UPDATED,
	order: 'desc',
};
const FILTER_OPTIONS_DEFAULT = {
	status: '',
	postType: '',
};

export default function SearchBar( props: Props ) {
	const { mode, handleSetSearch } = props;

	const sortOptions: Array< DropdownOption > = [
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

	const postTypeOptions: Array< DropdownOption > = [
		{
			label: translate( 'All' ),
			value: '',
		},
		{
			label: translate( 'Posts' ),
			value: 'post',
		},
		{
			label: translate( 'Pages' ),
			value: 'page',
		},
		{
			label: translate( 'Products' ),
			value: 'product',
		},
	];

	const [ searchInput, setSearchInput ] = React.useState< string | undefined >( '' );
	const [ sortOption, setSortOption ] = React.useState( SORT_OPTIONS_DEFAULT );
	const [ filterOption, setFilterOption ] = React.useState( FILTER_OPTIONS_DEFAULT );

	useEffect( () => {
		handleSetSearch( {
			search: '',
			order: SORT_OPTIONS_DEFAULT,
			filter: FILTER_OPTIONS_DEFAULT,
		} );
	}, [] );

	const onChangeStatus = ( status: string ) => {
		const newFilter = {
			...filterOption,
			status,
		};

		setFilterOption( newFilter );
		handleSetSearch( {
			search: searchInput || '',
			filter: newFilter,
		} );
	};

	const onChangeSearch = ( search: string ) => {
		setSearchInput( search );
		handleSetSearch( {
			search: search,
			order: sortOption,
			filter: filterOption,
		} );
	};

	const onChangePostTypeFilter = ( option: DropdownOption ) => {
		const newFilter = {
			...filterOption,
			postType: option.value,
		};

		setFilterOption( newFilter );
		handleSetSearch( {
			search: searchInput || '',
			order: sortOption,
			filter: newFilter,
		} );
	};

	const onChangeOrderOption = ( sort: DropdownOption ) => {
		const newOrder = {
			orderBy: sort.value,
			order: sort.value === 'post_title' ? 'asc' : 'desc',
		};

		setSortOption( newOrder );
		handleSetSearch( {
			search: searchInput || '',
			order: newOrder,
			filter: filterOption,
		} );
	};

	const getSortLabel = () => {
		const selectedOption = sortOptions.find( ( item ) => item.value === sortOption.orderBy )?.label;

		return selectedOption
			? // translators: sortOption is something like Last published, Recently updated, etc.
			  translate( 'Sort: %(sortOption)s', {
					args: { sortOption: selectedOption },
			  } )
			: undefined;
	};

	const getPostTypeFilterLabel = () => {
		const selectedOption = postTypeOptions.find( ( item ) => item.value === filterOption.postType )
			?.label;

		return selectedOption
			? // translators: filterOption is something like All, Posts and Pages
			  translate( 'Post type: %(filterOption)s', {
					args: { filterOption: selectedOption },
			  } )
			: undefined;
	};

	return (
		<div className="promote-post-i2__search-bar-wrapper">
			<Search
				searchIcon={ <SearchIcon /> }
				className="promote-post-i2__search-bar-search"
				defaultValue={ searchInput }
				disableAutocorrect={ true }
				value={ searchInput }
				placeholder={ translate( 'Search…' ) }
				delaySearch={ true }
				delayTimeout={ 500 }
				isReskinned
				onSearch={ ( inputValue: string ) => {
					if ( inputValue !== null ) {
						onChangeSearch( inputValue );
					}
				} }
			/>

			<div className="promote-post-i2__search-bar-options">
				{ mode === 'posts' && (
					<>
						<SelectDropdown
							className="promote-post-i2__search-bar-dropdown post-type"
							onSelect={ onChangePostTypeFilter }
							options={ postTypeOptions }
							initialSelected={ filterOption.postType }
							selectedText={ getPostTypeFilterLabel() }
						/>
						<SelectDropdown
							className="promote-post-i2__search-bar-dropdown order-by"
							onSelect={ onChangeOrderOption }
							options={ sortOptions }
							initialSelected={ sortOption.orderBy }
							selectedText={ getSortLabel() }
						/>
					</>
				) }

				{ mode === 'campaigns' && (
					<CampaignsFilter
						handleChangeFilter={ onChangeStatus }
						campaignsFilter={ filterOption.status as CampaignsFilterType }
					/>
				) }
			</div>
		</div>
	);
}
