import './style.scss';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
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

	return (
		<Main wideLayout className="promote-post">
			<DocumentHead title={ translate( 'Advertising' ) } />
			<SitePreview />
			<FormattedHeader
				brandFont
				className="advertising-page-heading"
				headerText={ translate( 'Advertising' ) }
				align="left"
				hasScreenOptions
			/>
			<DocumentHead title={ translate( 'Advertising' ) } />
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
