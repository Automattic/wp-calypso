import { useTranslate } from 'i18n-calypso';
import React from 'react';
import './style.scss';
import Gridicon from 'calypso/../packages/components/src/gridicon';
import Search from 'calypso/components/search';
import SelectDropdown from 'calypso/components/select-dropdown';
import CampaignsFilter from '../campaigns-filter';

interface Props {
	mode: 'campaigns' | 'posts';
}

const sortOptions = [
	{
		label: 'Last published',
		value: 'last_published',
	},
];
export default function SearchBar( props: Props ) {
	const { mode } = props;

	const translate = useTranslate();
	const [ searchInput, setSearchInput ] = React.useState( '' );
	const [ currentSortOption, setSortOption ] = React.useState( sortOptions[ 0 ].value );

	const onSearch = () => {
		return;
	};

	const onClearIconClick = () => {
		setSearchInput( '' );
	};

	const onChangeFilter = () => {
		setSearchInput( '' );
	};

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
					selectedText=""
					/*
				selectedIcon={ <Gridicon size={ 18 } icon={ selectedDevice.icon } /> }
*/
				>
					{ sortOptions.map( ( sortOption ) => (
						<SelectDropdown.Item
							key={ sortOption.value }
							selected={ sortOption.value === currentSortOption }
							onClick={ () => setSortOption( sortOption.value ) }
						>
							{ sortOption.label }
						</SelectDropdown.Item>
					) ) }
				</SelectDropdown>
			) }

			{ mode === 'campaigns' && (
				<CampaignsFilter handleChangeFilter={ onChangeFilter } campaignsFilter="all" />
			) }
		</div>
	);
}
