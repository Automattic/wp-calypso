import { Reader } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { SortControls } from 'calypso/landing/subscriptions/components/sort-controls';
import { useSubscriberListManager } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import './style.scss';

const { SubscribersSortBy: SortBy } = Reader;

const getSortOptions = ( translate: ReturnType< typeof useTranslate > ) => [
	{ value: SortBy.Name, label: translate( 'Name' ) },
	{ value: SortBy.DateSubscribed, label: translate( 'Recently subscribed' ) },
];

const ListActionsBar = () => {
	const translate = useTranslate();
	const { handleSearch, sortTerm, setSortTerm } = useSubscriberListManager();
	const sortOptions = useMemo( () => getSortOptions( translate ), [ translate ] );

	return (
		<div className="list-actions-bar">
			<SearchInput
				placeholder={ translate( 'Search by name, username or email…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
			/>

			<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
		</div>
	);
};

export default ListActionsBar;
