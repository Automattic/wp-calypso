import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import PlanPrice from '@automattic/components/src/plan-price/docs/example';
import clsx from 'clsx';
import { trim } from 'lodash';
import { Component, Fragment } from 'react';
import AllSites from 'calypso/blocks/all-sites/docs/example';
import AnnouncementModalExample from 'calypso/blocks/announcement-modal/docs/example';
import AppPromo from 'calypso/blocks/app-promo/docs/example';
import AuthorCompactProfile from 'calypso/blocks/author-compact-profile/docs/example';
import AuthorSelector from 'calypso/blocks/author-selector/docs/example';
import CalendarButton from 'calypso/blocks/calendar-button/docs/example';
import CalendarPopover from 'calypso/blocks/calendar-popover/docs/example';
import ColorSchemePicker from 'calypso/blocks/color-scheme-picker/docs/example';
import CommentButtons from 'calypso/blocks/comment-button/docs/example';
import PostComment from 'calypso/blocks/comments/docs/post-comment-example';
import ConversationCaterpillar from 'calypso/blocks/conversation-caterpillar/docs/example';
import ConversationFollowButton from 'calypso/blocks/conversation-follow-button/docs/example';
import ConversationCommentList from 'calypso/blocks/conversations/docs/example';
import DataCenterPicker from 'calypso/blocks/data-center-picker/docs/example';
import DismissibleCard from 'calypso/blocks/dismissible-card/docs/example';
import FollowButton from 'calypso/blocks/follow-button/docs/example';
import ImageEditor from 'calypso/blocks/image-editor/docs/example';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt/docs/example';
import LikeButtons from 'calypso/blocks/like-button/docs/example';
import Login from 'calypso/blocks/login/docs/example';
import PlanStorage from 'calypso/blocks/plan-storage/docs/example';
import PlanThankYouCard from 'calypso/blocks/plan-thank-you-card/docs/example';
import PostEditButton from 'calypso/blocks/post-edit-button/docs/example';
import PostLikes from 'calypso/blocks/post-likes/docs/example';
import PostShare from 'calypso/blocks/post-share/docs/example';
import ProductPlanOverlapNotices from 'calypso/blocks/product-plan-overlap-notices/docs/example';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link/docs/example';
import ReaderAvatar from 'calypso/blocks/reader-avatar/docs/example';
import ReaderExportButton from 'calypso/blocks/reader-export-button/docs/example';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video/docs/example';
import ReaderImportButton from 'calypso/blocks/reader-import-button/docs/example';
import ReaderJoinConversationDialogExample from 'calypso/blocks/reader-join-conversation/docs/example';
import ReaderPostCard from 'calypso/blocks/reader-post-card/docs/example';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu/docs/example';
import RelatedPostCard from 'calypso/blocks/reader-related-card/docs/example';
import ReaderShare from 'calypso/blocks/reader-share/docs/example';
import ReaderSiteStreamLink from 'calypso/blocks/reader-site-stream-link/docs/example';
import ReaderSubscriptionListItem from 'calypso/blocks/reader-subscription-list-item/docs/example';
import SharingPreviewPane from 'calypso/blocks/sharing-preview-pane/docs/example';
import Site from 'calypso/blocks/site/docs/example';
import SitePlaceholder from 'calypso/blocks/site/docs/placeholder-example';
import SiteIcon from 'calypso/blocks/site-icon/docs/example';
import SupportArticleDialog from 'calypso/blocks/support-article-dialog/docs/example';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning/docs/example';
import UpsellNudge from 'calypso/blocks/upsell-nudge/docs/example';
import UserMentions from 'calypso/blocks/user-mentions/docs/example';
import VideoEditor from 'calypso/blocks/video-editor/docs/example';
import DocumentHead from 'calypso/components/data/document-head';
import HappinessSupport from 'calypso/components/happiness-support/docs/example';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PostSchedule from 'calypso/components/post-schedule/docs/example';
import ReadmeViewer from 'calypso/components/readme-viewer';
import SearchCard from 'calypso/components/search-card';
import SitesDropdown from 'calypso/components/sites-dropdown/docs/example';
import Theme from 'calypso/components/theme/docs/example';
import ThemesListExample from 'calypso/components/themes-list/docs/example';
import Collection from 'calypso/devdocs/design/search-collection';
import { slugToCamelCase } from 'calypso/devdocs/docs-example/util';
import PlanCompareCard from 'calypso/my-sites/plan-compare-card/docs/example';

export default class AppComponents extends Component {
	static displayName = 'AppComponents';
	state = { filter: '' };

	onSearch = ( term ) => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	backToComponents = () => {
		page( '/devdocs/blocks/' );
	};

	render() {
		const className = clsx( 'devdocs', 'devdocs__blocks', {
			'is-single': this.props.component,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="Blocks" />

				{ this.props.component ? (
					<Fragment>
						<HeaderCake onClick={ this.backToComponents } backText="All Blocks">
							{ slugToCamelCase( this.props.component ) }
						</HeaderCake>
						{ isEnabled( 'devdocs/color-scheme-picker' ) && (
							<ColorSchemePicker readmeFilePath="color-scheme-picker" />
						) }
					</Fragment>
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
					<AnnouncementModalExample readmeFilePath="announcement-modal" />
					<AllSites readmeFilePath="all-sites" />
					<AuthorSelector readmeFilePath="author-selector" />
					<AppPromo readmeFilePath="app-promo" />
					<CalendarButton readmeFilePath="calendar-button" />
					<CalendarPopover readmeFilePath="calendar-popover" />
					<CommentButtons readmeFilePath="comment-button" />
					<DataCenterPicker readmeFilePath="data-center-picker" />
					<FollowButton readmeFilePath="follow-button" />
					<HappinessSupport />
					<ImageEditor readmeFilePath="image-editor" />
					<VideoEditor readmeFilePath="video-editor" />
					<LikeButtons readmeFilePath="like-button" />
					<Login />
					<PostEditButton />
					<PlanStorage readmeFilePath="plan-storage" />
					<PostSchedule />
					<ProductPlanOverlapNotices readmeFilePath="product-plan-overlap-notices" />
					<Site readmeFilePath="site" />
					<SitePlaceholder />
					<SitesDropdown />
					<SiteIcon readmeFilePath="site-icon" />
					<Theme />
					<ThemesListExample />
					<PlanCompareCard />
					<RelatedPostCard />
					<ReaderAuthorLink readmeFilePath="reader-author-link" />
					<ReaderSubscriptionListItem />
					<ReaderSiteStreamLink readmeFilePath="reader-site-stream-link" />
					<AuthorCompactProfile />
					<ReaderPostCard />
					<PlanPrice />
					<PostShare readmeFilePath="post-share" />
					<PlanThankYouCard readmeFilePath="plan-thank-you-card" />
					<DismissibleCard readmeFilePath="dismissible-card" />
					<ReaderAvatar readmeFilePath="reader-avatar" />
					<ReaderPostOptionsMenu readmeFilePath="reader-post-options-menu" />
					<PostLikes readmeFilePath="post-likes" />
					<ReaderFeaturedVideo readmeFilePath="reader-featured-video" />
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
					<TimeMismatchWarning readmeFilePath="time-mismatch-warning" />
					<UpsellNudge />
					<JetpackReviewPrompt readmeFilePath="jetpack-review-prompt" />
					<ReaderJoinConversationDialogExample readmeFilePath="reader-join-conversation" />
				</Collection>
			</Main>
		);
	}
}
