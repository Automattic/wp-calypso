import { translate, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import ListEnd from 'calypso/components/list-end';
import Notice from 'calypso/components/notice';
import { useInfiniteScroll } from 'calypso/data/promote-post/use-infinite-scroll';
import usePromoteParams from 'calypso/data/promote-post/use-promote-params';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import EmptyPromotionList from 'calypso/my-sites/promote-post-i2/components/empty-promotion-list';
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

const noCampaignListMessage = translate(
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
			<Notice status="is-error" icon="mention">
				{ noCampaignListMessage }
			</Notice>
		);
	}

	/*if ( ! isPreviousData && isLoading ) {
		return (
			<div className="posts-list__loading-container">
				<SitePlaceholder />
			</div>
		);
	}*/

	return (
		<>
			<SearchBar mode="posts" handleSetSearch={ ( search ) => handleSearchOptions( search ) } />
			{ ! isLoading && posts?.length === 0 ? (
				<>
					{ totalCampaigns === 0 ? (
						<EmptyPromotionList type="posts" />
					) : (
						<>{ translate( 'No posts match your search' ) }</>
					) }
				</>
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
						<>
							<ListEnd />
						</>
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
