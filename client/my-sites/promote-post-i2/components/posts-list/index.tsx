import { translate, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import EmptyContent from 'calypso/components/empty-content';
import ListEnd from 'calypso/components/list-end';
import Notice from 'calypso/components/notice';
import { useInfiniteScroll } from 'calypso/data/promote-post/use-infinite-scroll';
import usePromoteParams from 'calypso/data/promote-post/use-promote-params';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import { BlazablePost } from 'calypso/my-sites/promote-post-i2/components/post-item';
import { DSPMessage } from 'calypso/my-sites/promote-post-i2/main';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
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

	const { isModalOpen, selectedSiteId, selectedPostId, keyValue } = usePromoteParams();
	const currentQuery = useSelector( getCurrentQueryArguments );
	const sourceQuery = currentQuery?.[ 'source' ];
	const source = sourceQuery ? sourceQuery.toString() : undefined;

	const { containerRef } = useInfiniteScroll( {
		offset: '200px',
		shouldStop: ! hasMorePages || isLoading || isFetching,
		async onLoadMore() {
			await fetchNextPage();
		},
	} );

	const isEmpty = posts?.length === 0;

	if ( isError && hasLocalUser ) {
		return (
			<Notice className="promote-post-i2__aux-wrapper" status="is-error" icon="mention">
				{ fetchErrorListMessage }
			</Notice>
		);
	}

	return (
		<>
			<SearchBar mode="posts" handleSetSearch={ ( search ) => handleSearchOptions( search ) } />
			{ ! isLoading && posts?.length === 0 ? (
				<div className="promote-post-i2__aux-wrapper">
					{ totalCampaigns === 0 ? (
						<EmptyContent
							className="promote-post-i2__empty-content"
							title={ translate( 'You have no posts or pages.' ) }
							line={ translate(
								"Start by creating a post or a page and start promoting it once it's ready"
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
							/>
						) }
					</div>
					{ ! isEmpty && ! isError && (
						<div className="promote-post-i2__aux-wrapper">
							<ListEnd />
						</div>
					) }
				</>
			) }

			{ selectedSiteId && selectedPostId && keyValue && (
				<BlazePressWidget
					isVisible={ isModalOpen }
					siteId={ selectedSiteId }
					postId={ selectedPostId }
					keyValue={ keyValue }
					source={ source }
				/>
			) }
		</>
	);
}
