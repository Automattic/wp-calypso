import { SelectDropdown } from '@automattic/components';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Option, SortControls } from 'calypso/landing/subscriptions/components/sort-controls';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSubscribersFilterOptions } from 'calypso/landing/subscriptions/hooks';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { SubscribersFilterBy, SubscribersSortBy } from '../../constants';
import useManySubsSite from '../../hooks/use-many-subs-site';
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
		grandTotal,
	} = useSubscribersPage();
	const sortOptions = useMemo( () => getSortOptions( translate ), [ translate ] );
	const recordSort = useRecordSort();
	const { hasManySubscribers } = useManySubsSite( siteId );
	const filterOptions = useSubscribersFilterOptions( hasManySubscribers, siteId );
	const selectedText = translate( 'Subscribers: %s', {
		args: getOptionLabel( filterOptions, filterOption ) || '',
	} );

	if ( grandTotal < 3 ) {
		return <></>;
	}

	return (
		<div className="list-actions-bar">
			<SearchInput
				placeholder={ translate( 'Search by name, username or email…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
				onSearchClose={ () => handleSearch( '' ) }
				defaultValue={ searchTerm }
			/>

			{ /* TODO: with too many subscribers, we're showing filter to split list between the types of users for performance reasons. */ }
			{ hasManySubscribers && (
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
			) }

			{ /* TODO: with too many subscribers, we're hiding sorting for performance reasons. */ }
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
