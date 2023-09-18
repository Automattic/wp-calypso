import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Option, SortControls } from 'calypso/landing/subscriptions/components/sort-controls';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSubscribersFilterOptions } from 'calypso/landing/subscriptions/hooks';
import useSubscribersTotalsQueries from 'calypso/my-sites/stats/hooks/use-subscribers-totals-query';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
import './style.scss';
import { useRecordSort } from '../../tracks';

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ) => [
	{ value: SubscribersSortBy.Name, label: translate( 'Name' ) },
	{ value: SubscribersSortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
];

const ListActionsBar = () => {
	const translate = useTranslate();
	const {
		handleSearch,
		searchTerm,
		pageChangeCallback,
		sortTerm,
		setSortTerm,
		filterOption,
		setFilterOption,
		siteId,
	} = useSubscribersPage();
	const sortOptions = useMemo( () => getSortOptions( translate ), [ translate ] );
	const recordSort = useRecordSort();
	const { data: subscribersTotals = { total: 0 } } = useSubscribersTotalsQueries( siteId );
	const totalSubscribers = subscribersTotals?.total ?? 0;
	const hasManySubscribers = totalSubscribers > 30000; // 30000 is the limit of subscribers that can be fetched without breaking the endpoint. This is a temporal solution.
	const filterOptions = useSubscribersFilterOptions( hasManySubscribers );
	const selectedText = translate( 'Subscribers: %s', {
		args: getOptionLabel( filterOptions, filterOption ) || '',
	} );

	return (
		<div className="list-actions-bar">
			<SearchInput
				placeholder={ translate( 'Search by name, username or email…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
				onSearchClose={ () => handleSearch( '' ) }
				defaultValue={ searchTerm }
			/>

			<SelectDropdown
				className="subscribers__filter-control"
				options={ filterOptions }
				onSelect={ ( selectedOption: Option< SubscribersFilterBy > ) => {
					setFilterOption( selectedOption.value );
					pageChangeCallback( 1 );
				} }
				selectedText={ selectedText }
				initialSelected={ filterOption }
			/>

			{ ! hasManySubscribers && (
				<SortControls
					options={ sortOptions }
					value={ sortTerm }
					onChange={ ( term ) => {
						setSortTerm( term );
						recordSort( { sort_field: term } );
					} }
				/>
			) }
		</div>
	);
};

export default ListActionsBar;
