import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { useSubscriberListManager } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import './style.scss';

const ListActionsBar = () => {
	const translate = useTranslate();
	const { handleSearch } = useSubscriberListManager();

	return (
		<div className="list-actions-bar">
			<SearchInput
				placeholder={ translate( 'Search by site name or address…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
			/>
		</div>
	);
};

export default ListActionsBar;
