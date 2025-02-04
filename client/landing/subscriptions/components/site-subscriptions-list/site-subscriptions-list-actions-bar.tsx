import { SelectDropdown } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSiteSubscriptionsFilterOptions } from 'calypso/landing/subscriptions/hooks/';
import './styles/site-subscriptions-list-actions-bar.scss';

const { SiteSubscriptionsSortBy: SortBy } = Reader;

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ) => [
	{ value: SortBy.LastUpdated, label: translate( 'Recently updated' ) },
	{ value: SortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
	{ value: SortBy.SiteName, label: translate( 'Site name' ) },
];

const ListActionsBar = () => {
	const translate = useTranslate();
	const { searchTerm, setSearchTerm, sortTerm, setSortTerm, filterOption, setFilterOption } =
		SubscriptionManager.useSiteSubscriptionsQueryProps();

	const filterOptions = useSiteSubscriptionsFilterOptions();
	const sortOptions = useMemo( () => getSortOptions( translate ), [ translate ] );

	return (
		<div className="site-subscriptions-list-actions-bar">
			<SearchInput
				delaySearch
				placeholder={ translate( 'Search by site name or address…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ setSearchTerm }
				defaultValue={ searchTerm }
			/>

			<SelectDropdown
				className="list-actions-bar__filter-control list-actions-bar__spacer"
				options={ filterOptions }
				onSelect={ ( selectedOption: Option< Reader.SiteSubscriptionsFilterBy > ) =>
					setFilterOption( selectedOption.value )
				}
				selectedText={ translate( 'View: %s', {
					args: getOptionLabel( filterOptions, filterOption ) || '',
				} ) }
			/>

			<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
		</div>
	);
};

export default ListActionsBar;
