import './style.scss';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import useCampaignsQuery from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import CampaignsList from 'calypso/my-sites/promote-post/components/campaigns-list';
import PostsList from 'calypso/my-sites/promote-post/components/posts-list';
import PostsListBanner from 'calypso/my-sites/promote-post/components/posts-list-banner';
import PromotePostTabBar from 'calypso/my-sites/promote-post/components/promoted-post-filter';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export type TabType = 'posts' | 'campaigns';
export type TabOption = {
	id: TabType;
	name: string;
};

interface Props {
	tab?: TabType;
}

export default function PromotedPosts( { tab }: Props ) {
	const selectedTab = tab === 'campaigns' ? 'campaigns' : 'posts';
	const selectedSiteId = useSelector( getSelectedSiteId );
	const { isLoading: campaignsIsLoading, data: campaignsData } = useCampaignsQuery(
		selectedSiteId ?? 0
	);

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
				'Promote a post to attract high-quality traffic to your site. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: learnMoreLink,
					},
				}
		  );

	return (
		<Main wideLayout className="promote-post">
			<DocumentHead title={ translate( 'Advertising' ) } />
			<SitePreview />
			<FormattedHeader
				brandFont
				className="advertising__page-header"
				headerText={ translate( 'Advertising' ) }
				subHeaderText={ subtitle }
				align="left"
			/>
			<SitePreview />
			{ ! campaignsData?.length && ! campaignsIsLoading && <PostsListBanner /> }
			<PromotePostTabBar tabs={ tabs } selectedTab={ selectedTab } />
			{ selectedTab === 'campaigns' && campaignsData && (
				<CampaignsList isLoading={ campaignsIsLoading } campaigns={ campaignsData } />
			) }
			{ selectedTab === 'posts' && <PostsList /> }

			<div className="promote-post__footer">
				<p>
					By promoting your post you agree to{ ' ' }
					<a href="https://wordpress.com/tos/" target={ '_blank' } rel="noreferrer">
						WordPress.com Terms
					</a>{ ' ' }
					and{ ' ' }
					<a href="https://automattic.com/privacy/" target={ 'blank' }>
						Advertising Terms
					</a>
					.
				</p>
			</div>
		</Main>
	);
}
