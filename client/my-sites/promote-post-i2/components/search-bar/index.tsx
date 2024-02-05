import config from '@automattic/calypso-config';
import Search, { SearchIcon } from '@automattic/search';
import { useMediaQuery } from '@wordpress/compose';
import { translate } from 'i18n-calypso';
import React, { useEffect, useRef } from 'react';
import './style.scss';
import SegmentedControl from 'calypso/components/segmented-control';
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
	postType?: string;
	handleFilterPostTypeChange?: ( type: string ) => void;
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
const SORT_OPTIONS_BUDGET_HIGH_LOW = 'budget_high_low';
const SORT_OPTIONS_BUDGET_LOW_HIGH = 'budget_low_high';
const SORT_OPTIONS_IMPRESSIONS_HIGH_LOW = 'impressions_high_low';
const SORT_OPTIONS_IMPRESSIONS_LOW_HIGH = 'impressions_low_high';

export const SORT_OPTIONS_DEFAULT = {
	orderBy: SORT_OPTIONS_RECENTLY_UPDATED,
	order: 'desc',
};

export const CAMPAIGNS_SORT_OPTIONS_DEFAULT = {
	orderBy: SORT_OPTIONS_LAST_PUBLISHED,
	order: 'desc',
};

const FILTER_OPTIONS_DEFAULT = {
	status: '',
	postType: '',
};

export default function SearchBar( props: Props ) {
	const { mode, handleSetSearch, postType, handleFilterPostTypeChange } = props;
	const isWooStore = config.isEnabled( 'is_running_in_woo_site' );

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

	const campaignSortOptions: Array< DropdownOption > = [
		{
			label: translate( 'Recently published' ),
			value: SORT_OPTIONS_LAST_PUBLISHED,
		},
		{
			label: translate( 'Budget: High - Low' ),
			value: SORT_OPTIONS_BUDGET_HIGH_LOW,
		},
		{
			label: translate( 'Budget: Low - High' ),
			value: SORT_OPTIONS_BUDGET_LOW_HIGH,
		},
		{
			label: translate( 'Impressions: High - Low' ),
			value: SORT_OPTIONS_IMPRESSIONS_HIGH_LOW,
		},
		{
			label: translate( 'Impressions: Low - High' ),
			value: SORT_OPTIONS_IMPRESSIONS_LOW_HIGH,
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

	const wooPostTypeOptions = [
		{
			value: 'product',
			label: translate( 'Products' ),
		},
		{
			value: 'post,page',
			label: translate( 'Posts & Pages' ),
		},
	];

	const campaignFilterOptions = [
		{
			value: '',
			label: translate( 'All' ),
		},
		{
			value: 'active',
			label: translate( 'Active', { context: 'comment status' } ),
		},
		{
			value: 'created',
			label: translate( 'In moderation', { context: 'comment status' } ),
		},
		{
			value: 'finished',
			label: translate( 'Completed', { context: 'comment status' } ),
		},
		{
			value: 'rejected',
			label: translate( 'Rejected', { context: 'comment status' } ),
		},
	];

	const options = isWooStore ? wooPostTypeOptions : postTypeOptions;
	// Smooth horizontal scrolling on mobile views
	const tabsRef = useRef< { [ key: string ]: HTMLSpanElement | null } >( {} );
	const [ searchInput, setSearchInput ] = React.useState< string | undefined >( '' );
	const [ sortOption, setSortOption ] = React.useState( SORT_OPTIONS_DEFAULT );
	const [ campaignSortOption, setCampaignSortOption ] = React.useState(
		CAMPAIGNS_SORT_OPTIONS_DEFAULT
	);
	const [ filterOption, setFilterOption ] = React.useState( FILTER_OPTIONS_DEFAULT );
	const isDesktop = useMediaQuery( '(min-width: 1055px)' );

	useEffect( () => {
		handleSetSearch( {
			search: '',
			order: SORT_OPTIONS_DEFAULT,
			filter: { ...FILTER_OPTIONS_DEFAULT, postType: postType || '' },
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

	const onChangePostTypeFilter = ( option: string ) => {
		const newFilter = {
			...filterOption,
			postType: option,
		};

		if ( handleFilterPostTypeChange ) {
			handleFilterPostTypeChange( option );
		}

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

	const onCampaignChangeOrderOption = ( sort: DropdownOption ) => {
		const newOrder = {
			orderBy: sort.value,
			order:
				sort.value === 'budget_high_low' || sort.value === 'impressions_high_low' ? 'desc' : 'asc',
		};

		setCampaignSortOption( newOrder );
		handleSetSearch( {
			search: searchInput || '',
			order: newOrder,
			filter: filterOption,
		} );
	};

	const getSortLabel = () => {
		const selectedOption = campaignSortOptions.find(
			( item ) => item.value === campaignSortOption.orderBy
		)?.label;

		if ( selectedOption ) {
			return isDesktop
				? translate( 'Sort: %(sortOption)s', {
						args: { sortOption: selectedOption },
				  } )
				: selectedOption;
		}

		return undefined;
	};

	const getPostTypeFilterLabel = () => {
		const options = isWooStore ? wooPostTypeOptions : postTypeOptions;

		const selectedOption = options.find( ( item ) => item.value === postType )?.label;

		return selectedOption
			? // translators: filterOption is something like All, Posts and Pages
			  translate( 'Post type: %(filterOption)s', {
					args: { filterOption: selectedOption },
			  } )
			: undefined;
	};

	const getCampaignFilterLabel = () => {
		const selectedOption = campaignFilterOptions.find(
			( item ) => item.value === filterOption.status
		)?.label;

		return selectedOption
			? // translators: filterOption is something like All, Active, In Moderation, Completed or Rejected.
			  translate( '%(filterOption)s campaigns', {
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
						{ isDesktop ? (
							<SegmentedControl primary compact>
								{ options.map( ( option ) => (
									<SegmentedControl.Item
										key={ option.value }
										selected={ postType === option.value }
										onClick={ () => onChangePostTypeFilter( option.value ) }
									>
										<span ref={ ( el ) => ( tabsRef.current[ option.value ] = el ) }>
											{ ' ' }
											{ option.label }{ ' ' }
										</span>
									</SegmentedControl.Item>
								) ) }
							</SegmentedControl>
						) : (
							<SelectDropdown
								className="promote-post-i2__search-bar-dropdown post-type"
								onSelect={ ( option: DropdownOption ) => onChangePostTypeFilter( option.value ) }
								options={ isWooStore ? wooPostTypeOptions : postTypeOptions }
								initialSelected={ postType }
								selectedText={ getPostTypeFilterLabel() }
							/>
						) }

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
					<>
						{ isDesktop && (
							<CampaignsFilter
								handleChangeFilter={ onChangeStatus }
								campaignsFilter={ filterOption.status as CampaignsFilterType }
							/>
						) }

						{ ! isDesktop && (
							<SelectDropdown
								className="promote-post-i2__search-bar-dropdown campaigns-filter"
								onSelect={ ( option: DropdownOption ) => onChangeStatus( option.value ) }
								options={ campaignFilterOptions }
								initialSelected={ filterOption.status }
								selectedText={ getCampaignFilterLabel() }
							/>
						) }

						<SelectDropdown
							className="promote-post-i2__search-bar-dropdown campaigns-order-by"
							onSelect={ onCampaignChangeOrderOption }
							options={ campaignSortOptions }
							initialSelected={ campaignSortOption.orderBy }
							selectedText={ getSortLabel() }
						/>
					</>
				) }
			</div>
		</div>
	);
}
