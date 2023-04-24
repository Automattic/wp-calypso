import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { SortControls, Option } from 'calypso/landing/subscriptions/components/sort-controls';
import useSearch from 'calypso/landing/subscriptions/hooks/use-search';
import TabView from '../tab-view';

const SortBy = SubscriptionManager.PostSubscriptionsSortBy;

const useSortOptions = (): Option[] => {
	const translate = useTranslate();

	return [
		{ value: SortBy.RecentlySubscribed, label: translate( 'Recently subscribed' ) },
		{ value: SortBy.PostName, label: translate( 'Post name' ) },
	];
};

const isListControlsEnabled = config.isEnabled( 'subscription-management/comments-list-controls' );

const Comments = () => {
	const translate = useTranslate();
	const [ sortTerm, setSortTerm ] = useState( SortBy.RecentlySubscribed );
	const { searchTerm, handleSearch } = useSearch();
	const sortOptions = useSortOptions();

	const {
		data: { posts, totalCount },
		isLoading,
		error,
	} = SubscriptionManager.usePostSubscriptionsQuery( { searchTerm, sortTerm } );

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ! totalCount ) {
		return (
			<Notice type="warning">{ translate( 'You are not subscribed to any comments.' ) }</Notice>
		);
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			{ isListControlsEnabled && (
				<div className="subscriptions-manager__list-actions-bar">
					<SearchInput
						// todo: translate when we have agreed on the placeholder
						placeholder="Search by post, site title, or address…"
						searchIcon={ <SearchIcon size={ 18 } /> }
						onSearch={ handleSearch }
					/>
					<SortControls options={ sortOptions } value={ sortTerm } onChange={ setSortTerm } />
				</div>
			) }

			<CommentList posts={ posts } />

			{ totalCount && posts?.length === 0 && (
				<Notice type="warning">
					{ translate( 'Sorry, no posts match {{italic}}%s.{{/italic}}', {
						components: { italic: <i /> },
						args: searchTerm,
					} ) }
				</Notice>
			) }
		</TabView>
	);
};

export default Comments;
