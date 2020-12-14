/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import classnames from 'classnames';
import { trim } from 'lodash';
import { slugToCamelCase } from 'calypso/devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import Collection from 'calypso/devdocs/design/search-collection';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import ReadmeViewer from 'calypso/components/readme-viewer';
import SearchCard from 'calypso/components/search-card';
import { isEnabled } from 'calypso/config';

/**
 * Docs examples
 */
import AllSites from 'calypso/blocks/all-sites/docs/example';
import CalendarButton from 'calypso/blocks/calendar-button/docs/example';
import CalendarPopover from 'calypso/blocks/calendar-popover/docs/example';
import AuthorSelector from 'calypso/blocks/author-selector/docs/example';
import CommentButtons from 'calypso/blocks/comment-button/docs/example';
import FollowButton from 'calypso/blocks/follow-button/docs/example';
import LikeButtons from 'calypso/blocks/like-button/docs/example';
import PostSchedule from 'calypso/components/post-schedule/docs/example';
import PostSelector from 'calypso/my-sites/post-selector/docs/example';
import ProductPlanOverlapNotices from 'calypso/blocks/product-plan-overlap-notices/docs/example';
import ProductSelector from 'calypso/blocks/product-selector/docs/example';
import Site from 'calypso/blocks/site/docs/example';
import SitePlaceholder from 'calypso/blocks/site/docs/placeholder-example';
import SitesDropdown from 'calypso/components/sites-dropdown/docs/example';
import SiteIcon from 'calypso/blocks/site-icon/docs/example';
import Theme from 'calypso/components/theme/docs/example';
import HappinessSupport from 'calypso/components/happiness-support/docs/example';
import ThemesListExample from 'calypso/components/themes-list/docs/example';
import PlanStorage from 'calypso/blocks/plan-storage/docs/example';
import PlanCompareCard from 'calypso/my-sites/plan-compare-card/docs/example';
import DomainTip from 'calypso/blocks/domain-tip/docs/example';
import PostItem from 'calypso/blocks/post-item/docs/example';
import PostStatus from 'calypso/blocks/post-status/docs/example';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link/docs/example';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link/docs/example';
import AuthorCompactProfile from 'calypso/blocks/author-compact-profile/docs/example';
import RelatedPostCard from 'calypso/blocks/reader-related-card/docs/example';
import PlanPrice from 'calypso/my-sites/plan-price/docs/example';
import PostShare from 'calypso/blocks/post-share/docs/example';
import PlanThankYouCard from 'calypso/blocks/plan-thank-you-card/docs/example';
import DismissibleCard from 'calypso/blocks/dismissible-card/docs/example';
import PostEditButton from 'calypso/blocks/post-edit-button/docs/example';
import PostComment from 'calypso/blocks/comments/docs/post-comment-example';
import ReaderAvatar from 'calypso/blocks/reader-avatar/docs/example';
import ImageEditor from 'calypso/blocks/image-editor/docs/example';
import ImageSelector from 'calypso/blocks/image-selector/docs/example';
import VideoEditor from 'calypso/blocks/video-editor/docs/example';
import ReaderPostCard from 'calypso/blocks/reader-post-card/docs/example';
import ReaderCombinedCard from 'calypso/blocks/reader-combined-card/docs/example';
import ReaderRecommendedSites from 'calypso/blocks/reader-recommended-sites/docs/example';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu/docs/example';
import DailyPostButton from 'calypso/blocks/daily-post-button/docs/example';
import ReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/docs/example';
import PostLikes from 'calypso/blocks/post-likes/docs/example';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video/docs/example';
import NpsSurvey from 'calypso/blocks/nps-survey/docs/example';
import ReaderExportButton from 'calypso/blocks/reader-export-button/docs/example';
import ReaderImportButton from 'calypso/blocks/reader-import-button/docs/example';
import SharingPreviewPane from 'calypso/blocks/sharing-preview-pane/docs/example';
import ReaderShare from 'calypso/blocks/reader-share/docs/example';
import Login from 'calypso/blocks/login/docs/example';
import LocationSearch from 'calypso/blocks/location-search/docs/example';
import ConversationCommentList from 'calypso/blocks/conversations/docs/example';
import ConversationCaterpillar from 'calypso/blocks/conversation-caterpillar/docs/example';
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button/docs/example';
import ColorSchemePicker from 'calypso/blocks/color-scheme-picker/docs/example';
import UserMentions from 'calypso/blocks/user-mentions/docs/example';
import SupportArticleDialog from 'calypso/blocks/support-article-dialog/docs/example';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning/docs/example';
import UpsellNudge from 'calypso/blocks/upsell-nudge/docs/example';

export default class AppComponents extends React.Component {
	static displayName = 'AppComponents';
	state = { filter: '' };

	onSearch = ( term ) => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	backToComponents = () => {
		page( '/devdocs/blocks/' );
	};

	render() {
		const className = classnames( 'devdocs', 'devdocs__blocks', {
			'is-single': this.props.component,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Blocks" />

				{ this.props.component ? (
					<React.Fragment>
						<HeaderCake onClick={ this.backToComponents } backText="All Blocks">
							{ slugToCamelCase( this.props.component ) }
						</HeaderCake>
						{ isEnabled( 'devdocs/color-scheme-picker' ) && (
							<ColorSchemePicker readmeFilePath="color-scheme-picker" />
						) }
					</React.Fragment>
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/blocks/README.md" />
						<SearchCard
							onSearch={ this.onSearch }
							initialValue={ this.state.filter }
							placeholder="Search blocks…"
							analyticsGroup="Docs"
						/>
					</div>
				) }
				<Collection
					component={ this.props.component }
					filter={ this.state.filter }
					section="blocks"
				>
					{ isEnabled( 'devdocs/color-scheme-picker' ) && (
						<ColorSchemePicker readmeFilePath="color-scheme-picker" />
					) }
					<AllSites readmeFilePath="all-sites" />
					<AuthorSelector readmeFilePath="author-selector" />
					<CalendarButton readmeFilePath="calendar-button" />
					<CalendarPopover readmeFilePath="calendar-popover" />
					<CommentButtons readmeFilePath="comment-button" />
					<FollowButton readmeFilePath="follow-button" />
					<HappinessSupport />
					<ImageEditor readmeFilePath="image-editor" />
					<VideoEditor readmeFilePath="video-editor" />
					<LikeButtons readmeFilePath="like-button" />
					<Login />
					<LocationSearch readmeFilePath="location-search" />
					<PostEditButton />
					<PlanStorage readmeFilePath="plan-storage" />
					<PostSchedule />
					<PostSelector />
					<ProductPlanOverlapNotices readmeFilePath="product-plan-overlap-notices" />
					<ProductSelector readmeFilePath="product-selector" />
					<Site readmeFilePath="site" />
					<SitePlaceholder />
					<SitesDropdown />
					<SiteIcon readmeFilePath="site-icon" />
					<Theme />
					<ThemesListExample />
					<PlanCompareCard />
					<DomainTip />
					<RelatedPostCard />
					<PostItem readmeFilePath="post-item" />
					<PostStatus readmeFilePath="post-status" />
					<ReaderAuthorLink readmeFilePath="reader-author-link" />
					<ReaderSubscriptionListItem />
					<ReaderSiteStreamLink readmeFilePath="reader-site-stream-link" />
					<AuthorCompactProfile />
					<ReaderPostCard />
					<ReaderCombinedCard />
					<ReaderRecommendedSites />
					<PlanPrice />
					<PostShare readmeFilePath="post-share" />
					<PlanThankYouCard readmeFilePath="plan-thank-you-card" />
					<DismissibleCard readmeFilePath="dismissible-card" />
					<ReaderAvatar readmeFilePath="reader-avatar" />
					<ReaderPostOptionsMenu readmeFilePath="reader-post-options-menu" />
					<DailyPostButton readmeFilePath="daily-post-button" />
					<PostLikes readmeFilePath="post-likes" />
					<ReaderFeaturedVideo readmeFilePath="reader-featured-video" />
					{ isEnabled( 'nps-survey/devdocs' ) && <NpsSurvey readmeFilePath="nps-survey" /> }
					<ReaderExportButton readmeFilePath="reader-export-button" />
					<ReaderImportButton readmeFilePath="reader-import-button" />
					<SharingPreviewPane />
					<ReaderShare readmeFilePath="reader-share" />
					<ConversationCommentList />
					<PostComment />
					<ConversationCaterpillar readmeFilePath="conversation-caterpillar" />
					<ConversationFollowButton />
					<UserMentions readmeFilePath="user-mentions" />
					<SupportArticleDialog />
					<ImageSelector readmeFilePath="image-selector" />
					<TimeMismatchWarning readmeFilePath="time-mismatch-warning" />
					<UpsellNudge />
				</Collection>
			</Main>
		);
	}
}
