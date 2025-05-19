import config from '@automattic/calypso-config';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { translate, useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyContent from 'calypso/components/empty-content';
import Notice from 'calypso/components/notice';
import { BlazablePost } from 'calypso/data/promote-post/types';
import { useInfiniteScroll } from 'calypso/data/promote-post/use-infinite-scroll';
import { DSPMessage } from 'calypso/my-sites/promote-post-i2/main';
import { APIError } from 'calypso/state/partner-portal/types';
import './style.scss';
import PostsTable from '../posts-table';
import SearchBar, { SearchOptions } from '../search-bar';

type Props = {
	isLoading: boolean;
	isError: DSPMessage | null;
	isFetching: boolean;
	fetchNextPage: () => void;
	handleSearchOptions: ( search: SearchOptions ) => void;
	totalCampaigns: number;
	hasMorePages: boolean;
	posts?: BlazablePost[];
	hasPaymentsBlocked: boolean;
};

const ERROR_NO_LOCAL_USER = 'no_local_user';
const ERROR_POSTS_NOT_READY = 'posts_not_ready';

const fetchErrorListMessage = translate(
	'There was a problem obtaining the posts list. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when filling out domain checkout contact details form',
	}
);

export const postsNotReadyErrorMessage = translate(
	'Blaze is syncing your content as part of first-time setup – this can take up to 15 minutes or a few hours.',
	{
		comment: 'Validation error when fetching the posts and they are not ready/sync',
	}
);

export default function PostsList( props: Props ) {
	const isWooStore = config.isEnabled( 'is_running_in_woo_site' );
	const initialPostType = isWooStore ? 'product' : '';
	const [ postType, setPostType ] = React.useState( initialPostType );
	const {
		isLoading,
		isError,
		isFetching,
		fetchNextPage,
		handleSearchOptions,
		totalCampaigns,
		hasMorePages,
		posts,
		hasPaymentsBlocked,
	} = props;

	const translate = useTranslate();

	const hasLocalUser = ( isError as DSPMessage )?.errorCode !== ERROR_NO_LOCAL_USER;
	const hasPostsNotReadyError = ( isError as APIError )?.code === ERROR_POSTS_NOT_READY;

	const { containerRef } = useInfiniteScroll( {
		offset: '200px',
		shouldStop: ! hasMorePages || isLoading || isFetching,
		async onLoadMore() {
			await fetchNextPage();
		},
	} );

	const onChangeFilter = ( postType: string ) => {
		setPostType( postType );
	};

	if ( isError && hasPostsNotReadyError ) {
		return (
			<Notice
				className="promote-post-notice promote-post-i2__aux-wrapper"
				status="is-info"
				icon="mention"
				showDismiss={ false }
			>
				{ postsNotReadyErrorMessage }
			</Notice>
		);
	}

	if ( isError && hasLocalUser ) {
		return (
			<Notice
				className="promote-post-notice promote-post-i2__aux-wrapper"
				status="is-error"
				icon="mention"
				showDismiss={ false }
			>
				{ fetchErrorListMessage }
			</Notice>
		);
	}

	return (
		<>
			<SearchBar
				mode="posts"
				handleSetSearch={ ( search ) => handleSearchOptions( search ) }
				postType={ postType }
				handleFilterPostTypeChange={ onChangeFilter }
			/>
			{ ! isLoading && posts?.length === 0 ? (
				<div className="promote-post-i2__aux-wrapper">
					{ totalCampaigns === 0 ? (
						<EmptyContent
							className="promote-post-i2__empty-content"
							title={ translate( 'You have no content to promote.' ) }
							line={ translate(
								'You have not published any posts, pages or products yet. Make sure your content is published and come back to promote it.'
							) }
						/>
					) : (
						<>{ translate( 'No posts match your search' ) }</>
					) }
				</div>
			) : (
				<>
					<div ref={ containerRef }>
						{ posts && (
							<PostsTable
								posts={ posts }
								isLoading={ isLoading }
								isFetchingPageResults={ isFetching }
								type={ postType }
								hasPaymentsBlocked={ hasPaymentsBlocked }
							/>
						) }
					</div>
				</>
			) }
		</>
	);
}
