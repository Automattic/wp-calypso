import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { SortControls } from 'calypso/landing/subscriptions/components/sort-controls';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { SubscribersSortBy } from '../../constants';
import useManySubsSite from '../../hooks/use-many-subs-site';
import './style.scss';
import { useRecordSort } from '../../tracks';

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ) => [
	{ value: SubscribersSortBy.Name, label: translate( 'Name' ) },
	{ value: SubscribersSortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
];

const ListActionsBar = () => {
	const translate = useTranslate();
	const { handleSearch, searchTerm, sortTerm, setSortTerm, siteId } = useSubscribersPage();
	const sortOptions = useMemo( () => getSortOptions( translate ), [ translate ] );
	const recordSort = useRecordSort();
	const { hasManySubscribers } = useManySubsSite( siteId );

	return (
		<div className="list-actions-bar">
			<SearchInput
				placeholder={ translate( 'Search by name, username or email…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
				onSearchClose={ () => handleSearch( '' ) }
				defaultValue={ searchTerm }
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
