/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { trim } from 'lodash';
import { slugToCamelCase } from 'client/devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import Collection from 'client/devdocs/design/search-collection';
import DocumentHead from 'client/components/data/document-head';
import HeaderCake from 'client/components/header-cake';
import Main from 'client/components/main';
import SearchCard from 'client/components/search-card';
import { isEnabled } from 'config';

/**
 * Docs examples
 */
import CreditCardForm from 'client/blocks/credit-card-form/docs/example';
import CalendarButton from 'client/blocks/calendar-button/docs/example';
import CalendarPopover from 'client/blocks/calendar-popover/docs/example';
import AuthorSelector from 'client/blocks/author-selector/docs/example';
import CommentButtons from 'client/blocks/comment-button/docs/example';
import DisconnectJetpackDialog from 'client/blocks/disconnect-jetpack/docs/example';
import FollowButton from 'client/blocks/follow-button/docs/example';
import LikeButtons from 'client/blocks/like-button/docs/example';
import PostSchedule from 'client/components/post-schedule/docs/example';
import PostSelector from 'client/my-sites/post-selector/docs/example';
import AllSites from 'client/my-sites/all-sites/docs/example';
import Site from 'client/blocks/site/docs/example';
import SitePlaceholder from 'client/blocks/site/docs/placeholder-example';
import SitesDropdown from 'client/components/sites-dropdown/docs/example';
import SiteIcon from 'client/blocks/site-icon/docs/example';
import Theme from 'client/components/theme/docs/example';
import HappinessSupport from 'client/components/happiness-support/docs/example';
import ThemesListExample from 'client/components/themes-list/docs/example';
import PlanStorage from 'client/blocks/plan-storage/docs/example';
import UpgradeNudge from 'client/my-sites/upgrade-nudge/docs/example';
import PlanCompareCard from 'client/my-sites/plan-compare-card/docs/example';
import FeatureComparison from 'client/my-sites/feature-comparison/docs/example';
import DomainTip from 'client/my-sites/domain-tip/docs/example';
import PostItem from 'client/blocks/post-item/docs/example';
import PostStatus from 'client/blocks/post-status/docs/example';
import PostTime from 'client/blocks/post-time/docs/example';
import ReaderAuthorLink from 'client/blocks/reader-author-link/docs/example';
import ReaderSiteStreamLink from 'client/blocks/reader-site-stream-link/docs/example';
import ReaderFullPostHeader from 'client/blocks/reader-full-post/docs/header-example';
import AuthorCompactProfile from 'client/blocks/author-compact-profile/docs/example';
import RelatedPostCardv2 from 'client/blocks/reader-related-card-v2/docs/example';
import PlanPrice from 'client/my-sites/plan-price/docs/example';
import PostShare from 'client/blocks/post-share/docs/example';
import PlanThankYouCard from 'client/blocks/plan-thank-you-card/docs/example';
import DismissibleCard from 'client/blocks/dismissible-card/docs/example';
import PostEditButton from 'client/blocks/post-edit-button/docs/example';
import PostComment from 'client/blocks/comments/docs/post-comment-example';
import ReaderAvatar from 'client/blocks/reader-avatar/docs/example';
import ImageEditor from 'client/blocks/image-editor/docs/example';
import VideoEditor from 'client/blocks/video-editor/docs/example';
import ReaderPostCard from 'client/blocks/reader-post-card/docs/example';
import ReaderCombinedCard from 'client/blocks/reader-combined-card/docs/example';
import ReaderRecommendedSites from 'client/blocks/reader-recommended-sites/docs/example';
import ReaderPostOptionsMenu from 'client/blocks/reader-post-options-menu/docs/example';
import DailyPostButton from 'client/blocks/daily-post-button/docs/example';
import ReaderSubscriptionListItem from 'client/blocks/reader-subscription-list-item/docs/example';
import PostLikes from 'client/blocks/post-likes/docs/example';
import ReaderFeaturedVideo from 'client/blocks/reader-featured-video/docs/example';
import NpsSurvey from 'client/blocks/nps-survey/docs/example';
import ReaderExportButton from 'client/blocks/reader-export-button/docs/example';
import ReaderImportButton from 'client/blocks/reader-import-button/docs/example';
import SharingPreviewPane from 'client/blocks/sharing-preview-pane/docs/example';
import ReaderShare from 'client/blocks/reader-share/docs/example';
import Login from 'client/blocks/login/docs/example';
import ReaderEmailSettings from 'client/blocks/reader-email-settings/docs/example';
import UploadImage from 'client/blocks/upload-image/docs/example';
import ConversationCommentList from 'client/blocks/conversations/docs/example';
import SimplePaymentsDialog from 'client/components/tinymce/plugins/simple-payments/dialog/docs/example';
import ConversationCaterpillar from 'client/blocks/conversation-caterpillar/docs/example';
import ConversationFollowButton from 'client/blocks/conversation-follow-button/docs/example';
import ColorSchemePicker from 'client/blocks/color-scheme-picker/docs/example';

export default class AppComponents extends React.Component {
	static displayName = 'AppComponents';
	state = { filter: '' };

	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	backToComponents = () => {
		page( '/devdocs/blocks/' );
	};

	render() {
		return (
			<Main className="design design__blocks">
				<DocumentHead title="Blocks" />
				{ this.props.component ? (
					<HeaderCake onClick={ this.backToComponents } backText="All Blocks">
						{ slugToCamelCase( this.props.component ) }
					</HeaderCake>
				) : (
					<SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search blocks…"
						analyticsGroup="Docs"
					/>
				) }
				<Collection
					component={ this.props.component }
					filter={ this.state.filter }
					section="blocks"
				>
					<AuthorSelector />
					<CalendarButton />
					<CalendarPopover />
					<CommentButtons />
					<DisconnectJetpackDialog />
					<CreditCardForm />
					<FollowButton />
					<HappinessSupport />
					<ImageEditor />
					<VideoEditor />
					<LikeButtons />
					<Login />
					<PostEditButton />
					<PlanStorage />
					<PostSchedule />
					<PostSelector />
					<AllSites />
					<Site />
					<SitePlaceholder />
					<SitesDropdown />
					<SiteIcon />
					<Theme />
					<ThemesListExample />
					<UpgradeNudge />
					<PlanCompareCard />
					<FeatureComparison />
					<DomainTip />
					<RelatedPostCardv2 />
					<PostItem />
					<PostStatus />
					<PostTime />
					<ReaderAuthorLink />
					<ReaderSubscriptionListItem />
					<ReaderSiteStreamLink />
					<ReaderFullPostHeader />
					<AuthorCompactProfile />
					<ReaderPostCard />
					<ReaderCombinedCard />
					<ReaderRecommendedSites />
					<PlanPrice />
					<PostShare />
					<PlanThankYouCard />
					<DismissibleCard />
					<ReaderAvatar />
					<ReaderPostOptionsMenu />
					<DailyPostButton />
					<PostLikes />
					<ReaderFeaturedVideo />
					{ isEnabled( 'nps-survey/devdocs' ) && <NpsSurvey /> }
					<ReaderExportButton />
					<ReaderImportButton />
					<SharingPreviewPane />
					<SimplePaymentsDialog />
					<ReaderShare />
					<ReaderEmailSettings />
					<UploadImage />
					<ConversationCommentList />
					<PostComment />
					<ConversationCaterpillar />
					<ConversationFollowButton />
					<ColorSchemePicker />
				</Collection>
			</Main>
		);
	}
}
