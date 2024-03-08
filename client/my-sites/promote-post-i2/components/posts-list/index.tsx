import config from '@automattic/calypso-config';
import { translate, useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyContent from 'calypso/components/empty-content';
import Notice from 'calypso/components/notice';
import { BlazablePost } from 'calypso/data/promote-post/types';
import { useInfiniteScroll } from 'calypso/data/promote-post/use-infinite-scroll';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { DSPMessage } from 'calypso/my-sites/promote-post-i2/main';
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
};

const ERROR_NO_LOCAL_USER = 'no_local_user';

const fetchErrorListMessage = translate(
	'There was a problem obtaining the posts list. Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when filling out domain checkout contact details form',
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
	} = props;

	const translate = useTranslate();

	const hasLocalUser = ( isError as DSPMessage )?.errorCode !== ERROR_NO_LOCAL_USER;

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
							illustration={ null }
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
							/>
						) }
					</div>
				</>
			) }
		</>
	);
}
