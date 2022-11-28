import './style.scss';
import { translate, useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import useCampaignsQuery, {
	UserStatus,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import CampaignsList from 'calypso/my-sites/promote-post/components/campaigns-list';
import { Post } from 'calypso/my-sites/promote-post/components/post-item';
import PostsList from 'calypso/my-sites/promote-post/components/posts-list';
import PostsListBanner from 'calypso/my-sites/promote-post/components/posts-list-banner';
import PromotePostTabBar from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import { getPostsForQuery, isRequestingPostsForQuery } from 'calypso/state/posts/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export type TabType = 'posts' | 'campaigns';
export type TabOption = {
	id: TabType;
	name: string;
};

interface Props {
	tab?: TabType;
}

const queryPost = {
	number: 20, // max supported by /me/posts endpoint for all-sites mode
	status: 'publish', // do not allow private or unpublished posts
	type: 'post',
};
const queryPage = {
	...queryPost,
	type: 'page',
};

const queryProducts = {
	...queryPost,
	type: 'product',
};

export type DSPMessage = {
	errorCode?: string;
};

function sortItemsByPublishedDate( items: Post[] ) {
	return items.slice( 0 ).sort( function ( a, b ) {
		if ( a.date && b.date ) {
			const dateCompare = Date.parse( b.date ) - Date.parse( a.date );
			if ( 0 !== dateCompare ) {
				return dateCompare;
			}
		}
		// ...otherwise, we return the greater of the two item IDs
		return b.ID - a.ID;
	} );
}

const ERROR_NO_LOCAL_USER = 'no_local_user';

const commonBanMessage = translate(
	'Please {{contactSupportLink}}contact support{{/contactSupportLink}} to fix the issue and continue using the service. ' +
		'Until this problem is resolved, all of your active campaigns will be suspended, as will your ability to start new one.',
	{
		components: {
			contactSupportLink: <a href={ CALYPSO_CONTACT } />,
		},
		comment: 'Validation error when trying to create a campaign if the user is banned',
	}
);

export default function PromotedPosts( { tab }: Props ) {
	const selectedTab = tab === 'campaigns' ? 'campaigns' : 'posts';
	const selectedSite = useSelector( getSelectedSite );

	const selectedSiteId = selectedSite?.ID || 0;

	const posts = useSelector( ( state ) => {
		const posts = getPostsForQuery( state, selectedSiteId, queryPost );
		return posts?.filter( ( post: any ) => ! post.password );
	} );

	const pages = useSelector( ( state ) => {
		const pages = getPostsForQuery( state, selectedSiteId, queryPage );
		return pages?.filter( ( page: any ) => ! page.password );
	} );

	const products = useSelector( ( state ) => {
		const products = getPostsForQuery( state, selectedSiteId, queryProducts );
		return products?.filter( ( product: any ) => ! product.password );
	} );

	const isLoadingPost = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPost )
	);
	const isLoadingPage = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPage )
	);
	const isLoadingProducts = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryProducts )
	);

	const campaignsData = useCampaignsQuery( selectedSiteId ?? 0 );
	const {
		isLoading: campaignsIsLoading,
		isError,
		isFetched,
		error: campaignError,
		data,
	} = campaignsData;
	const campaigns = data?.campaigns || [];
	const canCreateCampaigns = data?.canCreateCampaigns || false;
	const userStatus = data?.userStatus;

	const hasLocalUser = ( campaignError as DSPMessage )?.errorCode !== ERROR_NO_LOCAL_USER;

	const translate = useTranslate();

	const tabs: TabOption[] = [
		{ id: 'posts', name: translate( 'Ready to promote' ) },
		{ id: 'campaigns', name: translate( 'Campaigns' ) },
	];

	if ( usePromoteWidget() === PromoteWidgetStatus.DISABLED ) {
		page( '/' );
	}

	const subtitle = translate(
		'Reach new readers and customers by promoting a post or a page on our network of millions blogs and web sites. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
		{
			components: {
				learnMoreLink: <InlineSupportLink supportContext="advertising" showIcon={ false } />,
			},
		}
	);

	const getUserBanReason = ( userStatus: UserStatus ) => {
		switch ( userStatus.reason ) {
			case 'CHECKOUT_FAILED':
				return translate( 'We were unable to process the payment of $%(missingPaymentAmount)s. ', {
					args: {
						missingPaymentAmount: userStatus.missingPaymentAmount,
					},
					comment: 'The system cannot process the payment of missingPaymentAmount. Eg: $73',
				} );
		}
	};

	if ( selectedSite?.is_coming_soon ) {
		return (
			<EmptyContent
				className="campaigns-empty"
				title={ translate( 'Site is not published' ) }
				line={ translate( 'Start promoting posts by publishing your site' ) }
				illustration={ null }
			/>
		);
	}

	if ( selectedSite?.is_private ) {
		return (
			<EmptyContent
				className="campaigns-empty"
				title={ translate( 'Site is private' ) }
				line={ translate(
					'To start advertising, you must make your website public. You can do that from {{sitePrivacySettingsLink}}here{{/sitePrivacySettingsLink}}.',
					{
						components: {
							sitePrivacySettingsLink: (
								<a
									href={ `https://wordpress.com/settings/general/${ selectedSite.domain }#site-privacy-settings` }
									rel="noreferrer"
								/>
							),
						},
					}
				) }
				illustration={ null }
			/>
		);
	}

	const userBanReasonMessage = userStatus ? getUserBanReason( userStatus ) : [];

	const content = sortItemsByPublishedDate( [
		...( posts || [] ),
		...( pages || [] ),
		...( products || [] ),
	] );

	const isLoading = isLoadingPage && isLoadingPost && isLoadingProducts;

	return (
		<Main wideLayout className="promote-post">
			<DocumentHead title={ translate( 'Advertising' ) } />
			<FormattedHeader
				brandFont
				className="advertising__page-header"
				headerText={ translate( 'Advertising' ) }
				subHeaderText={ subtitle }
				align="left"
			/>
			{ ! campaignsIsLoading && ! campaigns?.length && <PostsListBanner /> }

			{ isFetched && ! canCreateCampaigns && (
				<Notice showDismiss={ false } status="is-warning">
					<>
						{ userBanReasonMessage }
						{ commonBanMessage }
					</>
				</Notice>
			) }

			<PromotePostTabBar tabs={ tabs } selectedTab={ selectedTab } />
			{ selectedTab === 'campaigns' && (
				<CampaignsList
					hasLocalUser={ hasLocalUser }
					isError={ isError }
					isLoading={ campaignsIsLoading }
					campaigns={ campaigns || [] }
				/>
			) }
			<QueryPosts siteId={ selectedSiteId } query={ queryPost } postId={ null } />
			<QueryPosts siteId={ selectedSiteId } query={ queryPage } postId={ null } />
			<QueryPosts siteId={ selectedSiteId } query={ queryProducts } postId={ null } />
			{ selectedTab === 'posts' && (
				<PostsList
					content={ content }
					isLoading={ isLoading }
					canCreateCampaigns={ canCreateCampaigns }
				/>
			) }
		</Main>
	);
}
