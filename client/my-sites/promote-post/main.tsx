import './style.scss';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPosts from 'calypso/components/data/query-posts';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import useCampaignsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
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

function sortItemsByModifiedDate( items: Post[] ) {
	return items.slice( 0 ).sort( function ( a, b ) {
		if ( a.modified && b.modified ) {
			const dateCompare = Date.parse( b.modified ) - Date.parse( a.modified );
			if ( 0 !== dateCompare ) {
				return dateCompare;
			}
		}
		// ...otherwise, we return the greater of the two item IDs
		return b.ID - a.ID;
	} );
}

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
	const isLoadingPost = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPost )
	);
	const isLoadingPage = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, selectedSiteId, queryPage )
	);

	const campaigns = useCampaignsQuery( selectedSiteId ?? 0 );
	const { isLoading: campaignsIsLoading, data: campaignsData, isError } = campaigns;

	const translate = useTranslate();

	const tabs: TabOption[] = [
		{ id: 'posts', name: translate( 'Ready to promote' ) },
		{ id: 'campaigns', name: translate( 'Campaigns' ) },
	];

	if ( usePromoteWidget() === PromoteWidgetStatus.DISABLED ) {
		page( '/' );
	}

	const learnMoreLink = <InlineSupportLink supportContext="advertising" showIcon={ false } />;

	const subtitle = campaignsData?.length
		? translate(
				'Reach more people promoting a post or a page to the larger WordPress.com community of blogs and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: learnMoreLink,
					},
				}
		  )
		: translate(
				'Reach more people promoting a post or a page to the larger WordPress.com community of blogs and sites. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: learnMoreLink,
					},
				}
		  );

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

	const content = sortItemsByModifiedDate( [ ...( posts || [] ), ...( pages || [] ) ] );

	const isLoading = isLoadingPage && isLoadingPost;

	return (
		<Main wideLayout className="promote-post">
			<SitePreview />
			<DocumentHead title={ translate( 'Advertising' ) } />

			<FormattedHeader
				brandFont
				className="advertising__page-header"
				headerText={ translate( 'Advertising' ) }
				subHeaderText={ campaignsData?.length ? subtitle : '' }
				align="left"
			/>
			<SitePreview />

			{ ! campaignsIsLoading && ! campaignsData?.length && <PostsListBanner /> }

			<PromotePostTabBar tabs={ tabs } selectedTab={ selectedTab } />
			{ selectedTab === 'campaigns' && (
				<CampaignsList
					isError={ isError }
					isLoading={ campaignsIsLoading }
					campaigns={ campaignsData || [] }
				/>
			) }

			<QueryPosts siteId={ selectedSiteId } query={ queryPost } postId={ null } />
			<QueryPosts siteId={ selectedSiteId } query={ queryPage } postId={ null } />

			{ selectedTab === 'posts' && <PostsList content={ content } isLoading={ isLoading } /> }
		</Main>
	);
}
