import config from '@automattic/calypso-config';
import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import useSearch from 'calypso/landing/subscriptions/hooks/use-search';
import TabView from '../tab-view';

const isSearchEnabled = config.isEnabled( 'subscription-management/posts-search' );

const Comments = () => {
	const translate = useTranslate();
	const { searchTerm, handleSearch } = useSearch();

	const {
		data: { posts, totalCount },
		isLoading,
		error,
	} = SubscriptionManager.usePostSubscriptionsQuery( { searchTerm } );

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ! totalCount ) {
		return (
			<Notice type="warning">{ translate( 'You are not subscribed to any comments.' ) }</Notice>
		);
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			{ isSearchEnabled && (
				<div className="subscriptions-manager__list-actions-bar">
					<SearchInput
						placeholder={ translate( 'Search by post name…' ) }
						searchIcon={ <SearchIcon size={ 18 } /> }
						onSearch={ handleSearch }
					/>
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
