import { SubscriptionManager } from '@automattic/data-stores';
import SearchInput from '@automattic/search';
import { useTranslate } from 'i18n-calypso';
import { CommentList } from 'calypso/landing/subscriptions/components/comment-list';
import { SearchIcon } from 'calypso/landing/subscriptions/components/icons';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import TabView from '../tab-view';

const Comments = () => {
	const translate = useTranslate();
	const { data: posts, isLoading, error } = SubscriptionManager.usePostSubscriptionsQuery();

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ( ! posts || ! posts.length ) ) {
		return (
			<Notice type="warning">{ translate( 'You are not subscribed to any comments.' ) }</Notice>
		);
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			<div className="subscriptions-manager__list-actions-bar">
				<SearchInput
					placeholder={ translate( 'Search by post name…' ) }
					searchIcon={ <SearchIcon size={ 18 } /> }
					// eslint-disable-next-line @typescript-eslint/no-empty-function -- until we implement search
					onSearch={ () => {} }
				/>
			</div>

			<CommentList posts={ posts } />
		</TabView>
	);
};

export default Comments;
