import './style.scss';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import SitePreview from 'calypso/blocks/site-preview';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import useCampaignsQuery, {
	Campaign,
} from 'calypso/data/promote-post/use-promote-post-campaigns-query';
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
export default function PromotedPosts() {
	const [ selectedTab, setSelectedTab ] = useState< TabType >( 'posts' );

	const tabs: TabOption[] = [
		{ id: 'posts', name: translate( 'Ready to promote' ) },
		{ id: 'campaigns', name: translate( 'Campaigns' ) },
	];

	if ( usePromoteWidget() === PromoteWidgetStatus.DISABLED ) {
		page( '/' );
	}

	const selectedSiteId = useSelector( getSelectedSiteId );
	const { isLoading, data } = useCampaignsQuery( selectedSiteId ?? 0 );
	const campaigns = useMemo< Campaign[] >( () => data || [], [ data ] );

	const firstCampaign = ! campaigns.length;

	return (
		<Main className="promote-post">
			{ /* todo do we need those? */ }
			{ /*<ScreenOptionsTab wpAdminPath="edit.php?post_type=page" />*/ }
			{ /*<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />*/ }
			<DocumentHead title={ translate( 'Promoted Posts' ) } />
			<SitePreview />
			<div className={ 'promote-post__header-container' }>
				<FormattedHeader
					brandFont
					className="promote-post__heading"
					headerText={ translate( 'Promoted posts' ) }
					subHeaderText={ translate(
						'Reach more people promoting a post or a page to the larger WordPress.com community of blogs and sites with our ad delivery system.'
					) }
					align="left"
					// hasScreenOptions
				/>
				<div className="promote-post__header-button-container formatted-header">
					<div className="promote-post formatted-header__subtitle">
						<Button isPrimary>{ translate( 'Promote a post' ) }</Button>
					</div>
				</div>
			</div>
			<PromotePostTabBar
				tabs={ tabs }
				selectedTab={ selectedTab }
				selectTab={ ( tab ) => setSelectedTab( tab ) }
			/>
			{ selectedTab === 'campaigns' && <CampaignsList /> }
			{ selectedTab === 'posts' && (
				<>
					{ ! isLoading && firstCampaign && <PostsListBanner /> }
					<PostsList />
				</>
			) }
		</Main>
	);
}
