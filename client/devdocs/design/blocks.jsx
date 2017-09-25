/** @format */
/**
 * External dependencies
 */
import { trim } from 'lodash';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import AuthorCompactProfile from 'blocks/author-compact-profile/docs/example';
import AuthorSelector from 'blocks/author-selector/docs/example';
import CalendarButton from 'blocks/calendar-button/docs/example';
import CalendarPopover from 'blocks/calendar-popover/docs/example';
import ColorSchemePicker from 'blocks/color-scheme-picker/docs/example';
import CommentButtons from 'blocks/comment-button/docs/example';
import CommentDetail from 'blocks/comment-detail/docs/example';
import PostComment from 'blocks/comments/docs/post-comment-example';
import ConversationCaterpillar from 'blocks/conversation-caterpillar/docs/example';
import ConversationCommentList from 'blocks/conversations/docs/example';
import CreditCardForm from 'blocks/credit-card-form/docs/example';
import DailyPostButton from 'blocks/daily-post-button/docs/example';
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack-dialog/docs/example';
import DismissibleCard from 'blocks/dismissible-card/docs/example';
import FollowButton from 'blocks/follow-button/docs/example';
import ImageEditor from 'blocks/image-editor/docs/example';
import LikeButtons from 'blocks/like-button/docs/example';
import Login from 'blocks/login/docs/example';
import NpsSurvey from 'blocks/nps-survey/docs/example';
import PlanStorage from 'blocks/plan-storage/docs/example';
import PlanThankYouCard from 'blocks/plan-thank-you-card/docs/example';
import PostEditButton from 'blocks/post-edit-button/docs/example';
import PostItem from 'blocks/post-item/docs/example';
import PostLikes from 'blocks/post-likes/docs/example';
import PostShare from 'blocks/post-share/docs/example';
import PostStatus from 'blocks/post-status/docs/example';
import PostTime from 'blocks/post-time/docs/example';
import ReaderAuthorLink from 'blocks/reader-author-link/docs/example';
import ReaderAvatar from 'blocks/reader-avatar/docs/example';
import ReaderCombinedCard from 'blocks/reader-combined-card/docs/example';
import ReaderEmailSettings from 'blocks/reader-email-settings/docs/example';
import ReaderExportButton from 'blocks/reader-export-button/docs/example';
import ReaderFeaturedVideo from 'blocks/reader-featured-video/docs/example';
import ReaderFullPostHeader from 'blocks/reader-full-post/docs/header-example';
import ReaderImportButton from 'blocks/reader-import-button/docs/example';
import ReaderPostCard from 'blocks/reader-post-card/docs/example';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu/docs/example';
import ReaderRecommendedSites from 'blocks/reader-recommended-sites/docs/example';
import RelatedPostCardv2 from 'blocks/reader-related-card-v2/docs/example';
import ReaderShare from 'blocks/reader-share/docs/example';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link/docs/example';
import ReaderSubscriptionListItem from 'blocks/reader-subscription-list-item/docs/example';
import SharingPreviewPane from 'blocks/sharing-preview-pane/docs/example';
import SiteIcon from 'blocks/site-icon/docs/example';
import Site from 'blocks/site/docs/example';
import SitePlaceholder from 'blocks/site/docs/placeholder-example';
import UploadImage from 'blocks/upload-image/docs/example';
import VideoEditor from 'blocks/video-editor/docs/example';
import HappinessSupport from 'components/happiness-support/docs/example';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PostSchedule from 'components/post-schedule/docs/example';
import SearchCard from 'components/search-card';
import SitesDropdown from 'components/sites-dropdown/docs/example';
import Theme from 'components/theme/docs/example';
import ThemesListExample from 'components/themes-list/docs/example';
import SimplePaymentsDialog from 'components/tinymce/plugins/simple-payments/dialog/docs/example';
import { isEnabled } from 'config';
import Collection from 'devdocs/design/search-collection';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import AllSites from 'my-sites/all-sites/docs/example';
import DomainTip from 'my-sites/domain-tip/docs/example';
import FeatureComparison from 'my-sites/feature-comparison/docs/example';
import PlanCompareCard from 'my-sites/plan-compare-card/docs/example';
import PlanPrice from 'my-sites/plan-price/docs/example';
import PostSelector from 'my-sites/post-selector/docs/example';
import UpgradeNudge from 'my-sites/upgrade-nudge/docs/example';

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
					<CommentDetail />
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
					<ColorSchemePicker />
				</Collection>
			</Main>
		);
	}
}
