import { Reader } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import SelectDropdown from 'calypso/components/select-dropdown';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSubscribersFilterOptions } from 'calypso/landing/subscriptions/hooks';
import { useSubscriberListManager } from 'calypso/my-sites/subscribers/components/subscriber-list-manager/subscriber-list-manager-context';
import './style.scss';

const ListActionsBar = () => {
	const translate = useTranslate();
	const { handleSearch, filterOption, setFilterOption } = useSubscriberListManager();
	const filterOptions = useSubscribersFilterOptions();

	return (
		<div className="list-actions-bar">
			<SearchInput
				placeholder={ translate( 'Search by site name or address…' ) }
				searchIcon={ <SearchIcon size={ 18 } /> }
				onSearch={ handleSearch }
			/>

			<SelectDropdown
				className="subscribers__filter-control"
				options={ filterOptions }
				onSelect={ ( selectedOption: Option< Reader.SubscribersFilterBy > ) =>
					setFilterOption( selectedOption.value )
				}
				selectedText={ translate( 'Subscription Type: %s', {
					args: getOptionLabel( filterOptions, filterOption ) || '',
				} ) }
			/>
		</div>
	);
};

export default ListActionsBar;
