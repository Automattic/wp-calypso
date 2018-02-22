/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { trim } from 'lodash';
import { slugToCamelCase } from 'devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import Collection from 'devdocs/design/search-collection';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';
import { isEnabled } from 'config';

/**
 * Docs examples
 */
import CreditCardForm from 'blocks/credit-card-form/docs/example';
import CalendarButton from 'blocks/calendar-button/docs/example';
import CalendarPopover from 'blocks/calendar-popover/docs/example';
import AuthorSelector from 'blocks/author-selector/docs/example';
import CommentButtons from 'blocks/comment-button/docs/example';
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack/docs/example';
import FollowButton from 'blocks/follow-button/docs/example';
import FollowMenu from 'blocks/follow-menu/docs/example';
import LikeButtons from 'blocks/like-button/docs/example';
import PostSchedule from 'components/post-schedule/docs/example';
import PostSelector from 'my-sites/post-selector/docs/example';
import AllSites from 'my-sites/all-sites/docs/example';
import Site from 'blocks/site/docs/example';
import SitePlaceholder from 'blocks/site/docs/placeholder-example';
import SitesDropdown from 'components/sites-dropdown/docs/example';
import SiteIcon from 'blocks/site-icon/docs/example';
import Theme from 'components/theme/docs/example';
import HappinessSupport from 'components/happiness-support/docs/example';
import ThemesListExample from 'components/themes-list/docs/example';
import PlanStorage from 'blocks/plan-storage/docs/example';
import UpgradeNudge from 'my-sites/upgrade-nudge/docs/example';
import PlanCompareCard from 'my-sites/plan-compare-card/docs/example';
import FeatureComparison from 'my-sites/feature-comparison/docs/example';
import DomainTip from 'my-sites/domain-tip/docs/example';
import PostItem from 'blocks/post-item/docs/example';
import PostStatus from 'blocks/post-status/docs/example';
import PostTime from 'blocks/post-time/docs/example';
import ReaderAuthorLink from 'blocks/reader-author-link/docs/example';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link/docs/example';
import ReaderFullPostHeader from 'blocks/reader-full-post/docs/header-example';
import AuthorCompactProfile from 'blocks/author-compact-profile/docs/example';
import RelatedPostCard from 'blocks/reader-related-card/docs/example';
import PlanPrice from 'my-sites/plan-price/docs/example';
import PostShare from 'blocks/post-share/docs/example';
import PlanThankYouCard from 'blocks/plan-thank-you-card/docs/example';
import DismissibleCard from 'blocks/dismissible-card/docs/example';
import PostEditButton from 'blocks/post-edit-button/docs/example';
import PostComment from 'blocks/comments/docs/post-comment-example';
import ReaderAvatar from 'blocks/reader-avatar/docs/example';
import ImageEditor from 'blocks/image-editor/docs/example';
import VideoEditor from 'blocks/video-editor/docs/example';
import ReaderPostCard from 'blocks/reader-post-card/docs/example';
import ReaderCombinedCard from 'blocks/reader-combined-card/docs/example';
import ReaderRecommendedSites from 'blocks/reader-recommended-sites/docs/example';
import ReaderPostOptionsMenu from 'blocks/reader-post-options-menu/docs/example';
import DailyPostButton from 'blocks/daily-post-button/docs/example';
import ReaderSubscriptionListItem from 'blocks/reader-subscription-list-item/docs/example';
import PostLikes from 'blocks/post-likes/docs/example';
import ReaderFeaturedVideo from 'blocks/reader-featured-video/docs/example';
import NpsSurvey from 'blocks/nps-survey/docs/example';
import ReaderExportButton from 'blocks/reader-export-button/docs/example';
import ReaderImportButton from 'blocks/reader-import-button/docs/example';
import SharingPreviewPane from 'blocks/sharing-preview-pane/docs/example';
import ReaderShare from 'blocks/reader-share/docs/example';
import Login from 'blocks/login/docs/example';
import ReaderEmailSettings from 'blocks/reader-email-settings/docs/example';
import UploadImage from 'blocks/upload-image/docs/example';
import ConversationCommentList from 'blocks/conversations/docs/example';
import SimplePaymentsDialog from 'components/tinymce/plugins/simple-payments/dialog/docs/example';
import ConversationCaterpillar from 'blocks/conversation-caterpillar/docs/example';
import ConversationFollowButton from 'blocks/conversation-follow-button/docs/example';
import ColorSchemePicker from 'blocks/color-scheme-picker/docs/example';
import SiteRenamer from 'blocks/simple-site-rename-form/docs/example';

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
					<FollowMenu />
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
					<RelatedPostCard />
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
					{ isEnabled( 'site-renamer/devdocs' ) && <SiteRenamer /> }
				</Collection>
			</Main>
		);
	}
}
