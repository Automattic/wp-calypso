import { SubscriptionManager } from '@automattic/data-stores';
import { SiteSubscriptionsFilterBy } from '@automattic/data-stores/src/reader/queries/use-post-subscriptions-query';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { useMemo, useState } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { useSearch } from 'calypso/landing/subscriptions/hooks';
import TabView from '../tab-view';

const SortBy = SubscriptionManager.PostSubscriptionsSortBy;

const useSortOptions = (): Option[] => {
	const translate = useTranslate();

	return [
		{ value: SortBy.RecentlySubscribed, label: translate( 'Recently subscribed' ) },
		{ value: SortBy.PostName, label: translate( 'Post name' ) },
	];
};

const useFilterOptions = () => {
	const translate = useTranslate();

	return useMemo(
		() => [
			{ value: SiteSubscriptionsFilterBy.All, label: translate( 'All' ) },
			{ value: SiteSubscriptionsFilterBy.Paid, label: translate( 'Paid' ) },
			{ value: SiteSubscriptionsFilterBy.P2, label: translate( 'P2' ) },
		],
		[ translate ]
	);
};

const getFilterLabel = (
	availableFilterOptions: Option[],
	filterValue: SiteSubscriptionsFilterBy
) => availableFilterOptions.find( ( option ) => option.value === filterValue )?.label;

const Comments = () => {
	const translate = useTranslate();
	const [ sortTerm, setSortTerm ] = useState( SortBy.RecentlySubscribed );
	const { searchTerm, handleSearch } = useSearch();
	const sortOptions = useSortOptions();
	const availableFilterOptions = useFilterOptions();
	const [ filterOption, setFilterOption ] = useState< SiteSubscriptionsFilterBy >(
		SiteSubscriptionsFilterBy.All
	);

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
				<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />

				<SelectDropdown
					className="subscriptions-manager__filter-control"
					options={ availableFilterOptions }
					onSelect={ ( selectedOption: Option ) =>
						setFilterOption( selectedOption.value as SiteSubscriptionsFilterBy )
					}
					selectedText={
						translate( 'View: ' ) + getFilterLabel( availableFilterOptions, filterOption )
					}
				/>
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
