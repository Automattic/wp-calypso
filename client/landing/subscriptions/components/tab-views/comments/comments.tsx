import { SelectDropdown } from '@automattic/components';
import { SubscriptionManager, Reader } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSiteSubscriptionsFilterOptions } from 'calypso/landing/subscriptions/hooks';
import TabView from '../tab-view';
import './styles.scss';

const { PostSubscriptionsSortBy: SortBy, SiteSubscriptionsFilterBy: FilterBy } = Reader;

const useSortOptions = () => {
	const translate = useTranslate();

	return [
		{ value: SortBy.RecentlySubscribed, label: translate( 'Recently subscribed' ) },
		{ value: SortBy.PostName, label: translate( 'Post name' ) },
	];
};

const Comments = () => {
	const translate = useTranslate();
	const [ sortTerm, setSortTerm ] = useState( SortBy.RecentlySubscribed );
	const [ searchTerm, setSearchTerm ] = useState< string >();
	const sortOptions = useSortOptions();
	const availableFilterOptions = useSiteSubscriptionsFilterOptions();
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
			<div className="comments-list-actions-bar">
				<SearchInput
					delaySearch
					placeholder={ translate( 'Search by post, site title, or address…' ) }
					searchIcon={ <SearchIcon size={ 18 } /> }
					onSearch={ setSearchTerm }
				/>

				<SelectDropdown
					className="list-actions-bar__filter-control list-actions-bar__spacer"
					options={ availableFilterOptions }
					onSelect={ ( selectedOption: Option< Reader.SiteSubscriptionsFilterBy > ) =>
						setFilterOption( selectedOption.value as Reader.SiteSubscriptionsFilterBy )
					}
					selectedText={ translate( 'View: %s', {
						args: getOptionLabel( availableFilterOptions, filterOption ) || '',
					} ) }
				/>

				<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
			</div>

			<CommentList posts={ posts } />

			{ totalCount && posts?.length === 0 && (
				<Notice type={ NoticeType.Warning }>
					{ translate( 'Sorry, no posts match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: searchTerm || getOptionLabel( availableFilterOptions, filterOption ),
					} ) }
				</Notice>
			) }
		</TabView>
	);
};

export default Comments;
