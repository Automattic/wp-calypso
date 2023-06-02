import { SubscriptionManager, Reader } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { useSearch } from 'calypso/landing/subscriptions/hooks';
import { getFilterLabel, useFilterOptions } from '../tab-filters/tab-filters';
import TabView from '../tab-view';

const { PostSubscriptionsSortBy: SortBy, SiteSubscriptionsFilterBy: FilterBy } = Reader;

const useSortOptions = (): Option[] => {
	const translate = useTranslate();

	return [
		{ value: SortBy.RecentlySubscribed, label: translate( 'Recently subscribed' ) },
		{ value: SortBy.PostName, label: translate( 'Post name' ) },
	];
};

const Comments = () => {
	const translate = useTranslate();
	const [ sortTerm, setSortTerm ] = useState( SortBy.RecentlySubscribed );
	const { searchTerm, handleSearch } = useSearch();
	const sortOptions = useSortOptions();
	const availableFilterOptions = useFilterOptions();
	const [ filterOption, setFilterOption ] = useState( FilterBy.All );

	const {
		data: { posts, totalCount },
		isLoading,
		error,
	} = SubscriptionManager.usePostSubscriptionsQuery( { searchTerm, sortTerm, filterOption } );

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ! totalCount ) {
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any comments.' ) }
			</Notice>
		);
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			<div className="subscriptions-manager__list-actions-bar">
				<SearchInput
					placeholder={ translate( 'Search by post, site title, or address…' ) }
					searchIcon={ <SearchIcon size={ 18 } /> }
					onSearch={ handleSearch }
				/>

				<SelectDropdown
					className="subscriptions-manager__filter-control subscriptions-manager__list-actions-bar-spacer"
					options={ availableFilterOptions }
					onSelect={ ( selectedOption: Option ) =>
						setFilterOption( selectedOption.value as Reader.SiteSubscriptionsFilterBy )
					}
					selectedText={ translate( 'View: %s', {
						args: getFilterLabel( availableFilterOptions, filterOption ) || '',
					} ) }
				/>

				<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
			</div>

			<CommentList posts={ posts } />

			{ totalCount && posts?.length === 0 && (
				<Notice type={ NoticeType.Warning }>
					{ translate( 'Sorry, no posts match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: searchTerm || getFilterLabel( availableFilterOptions, filterOption ),
					} ) }
				</Notice>
			) }
		</TabView>
	);
};

export default Comments;
