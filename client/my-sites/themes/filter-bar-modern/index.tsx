import { Icon, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { CategoryPillNavigation } from 'calypso/components/category-pill-navigation';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import { CustomSelectWrapper } from 'calypso/my-sites/themes/custom-select-wrapper';
import { DEFAULT_STATIC_FILTER } from 'calypso/state/themes/constants';
import { constructThemeShowcaseUrl } from '../helpers';
import './style.scss';

interface Category {
	key: string;
	text: string;
}

interface Tier {
	key: string;
	name: string;
}

interface FilterBarModernProps {
	categories: Category[];
	selectedCategory: string;
	onCategorySelect: ( category: Category ) => void;
	tiers: Tier[];
	selectedTier: string;
	onTierSelect: ( attrs: { selectedItem: Tier } ) => void;
	showTierFilter?: boolean;
	searchQuery?: string;
	onSearch?: ( query: string ) => void;
}

const FilterBarModern = ( {
	categories,
	selectedCategory,
	onCategorySelect,
	tiers,
	selectedTier,
	onTierSelect,
	showTierFilter = true,
	searchQuery = '',
	onSearch,
}: FilterBarModernProps ) => {
	const translate = useTranslate();
	const [ isSticky, setIsSticky ] = useState( false );
	const [ isSearchOpen, setIsSearchOpen ] = useState( false );

	const pillCategories = useMemo(
		() =>
			categories.map( ( category ) => ( {
				id: category.key,
				label: category.text,
				link: constructThemeShowcaseUrl( {
					tier: selectedTier,
					category: category.key,
					search: searchQuery,
					isLoggedIn: false,
				} ),
				...( category.key === DEFAULT_STATIC_FILTER && {
					icon: <Icon icon={ starEmpty } size={ 26 } />,
				} ),
			} ) ),
		[ categories, searchQuery, selectedTier ]
	);

	const handleCategorySelect = useCallback(
		( selectedId: string ) => {
			const category = categories.find( ( c ) => c.key === selectedId );
			if ( category ) {
				onCategorySelect( category );
			}
		},
		[ categories, onCategorySelect ]
	);

	const tierOptions = useMemo(
		() =>
			tiers.map( ( tier ) => ( {
				...tier,
				className: tier.key === selectedTier ? 'is-selected' : '',
			} ) ),
		[ tiers, selectedTier ]
	);

	const tierValue = useMemo( () => {
		const selectedTierObj = tiers.find( ( t ) => t.key === selectedTier );
		return {
			key: selectedTier,
			name: String(
				translate( 'View: %s', {
					args: selectedTierObj?.name ?? '',
				} )
			),
		};
	}, [ tiers, selectedTier, translate ] );

	return (
		<>
			<InView
				rootMargin="-1px 0px 0px 0px"
				threshold={ 1 }
				fallbackInView
				onChange={ ( inView ) => setIsSticky( ! inView ) }
			>
				<div className="filter-bar-modern__sentinel" />
			</InView>
			<div className={ clsx( 'filter-bar-modern', { 'is-sticky': isSticky } ) }>
				<div className="filter-bar-modern__content">
					{ isSticky && onSearch && (
						<div className="filter-bar-modern__search">
							<Search
								pinned
								isOpen={ isSearchOpen }
								onSearchOpen={ () => setIsSearchOpen( true ) }
								onSearchClose={ () => setIsSearchOpen( false ) }
								initialValue={ searchQuery }
								onSearch={ onSearch }
								placeholder={ translate( 'Search themes…' ) }
								searchMode={ SEARCH_MODE_ON_ENTER }
							/>
						</div>
					) }
					<CategoryPillNavigation
						categories={ pillCategories }
						selectedCategoryId={ selectedCategory }
						onSelect={ handleCategorySelect }
						disableMobileCollapse
					/>
					{ showTierFilter && (
						<CustomSelectWrapper
							className="filter-bar-modern__tier-select"
							label={ translate( 'View' ) }
							hideLabelFromVision={ false }
							__next40pxDefaultSize
							options={ tierOptions }
							value={ tierValue }
							onChange={ onTierSelect }
						/>
					) }
				</div>
			</div>
		</>
	);
};

export default FilterBarModern;
