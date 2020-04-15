/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import classnames from 'classnames';
import { trim } from 'lodash';
import { slugToCamelCase } from 'devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import Collection from 'devdocs/design/search-collection';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';
import SearchCard from 'components/search-card';
import { isEnabled } from 'config';

/**
 * Docs examples
 */
import AllSites from 'blocks/all-sites/docs/example';
import CreditCardForm from 'blocks/credit-card-form/docs/example';
import CalendarButton from 'blocks/calendar-button/docs/example';
import CalendarPopover from 'blocks/calendar-popover/docs/example';
import AuthorSelector from 'blocks/author-selector/docs/example';
import CommentButtons from 'blocks/comment-button/docs/example';
import DisconnectJetpackDialog from 'blocks/disconnect-jetpack/docs/example';
import FollowButton from 'blocks/follow-button/docs/example';
import LikeButtons from 'blocks/like-button/docs/example';
import PostSchedule from 'components/post-schedule/docs/example';
import PostSelector from 'my-sites/post-selector/docs/example';
import ProductPlanOverlapNotices from 'blocks/product-plan-overlap-notices/docs/example';
import ProductSelector from 'blocks/product-selector/docs/example';
import Site from 'blocks/site/docs/example';
import SitePlaceholder from 'blocks/site/docs/placeholder-example';
import SitesDropdown from 'components/sites-dropdown/docs/example';
import SiteIcon from 'blocks/site-icon/docs/example';
import Theme from 'components/theme/docs/example';
import HappinessSupport from 'components/happiness-support/docs/example';
import ThemesListExample from 'components/themes-list/docs/example';
import PlanStorage from 'blocks/plan-storage/docs/example';
import UpgradeNudge from 'blocks/upgrade-nudge/docs/example';
import UpgradeNudgeExpanded from 'blocks/upgrade-nudge-expanded/docs/example';
import PlanCompareCard from 'my-sites/plan-compare-card/docs/example';
import DomainTip from 'blocks/domain-tip/docs/example';
import PostItem from 'blocks/post-item/docs/example';
import PostStatus from 'blocks/post-status/docs/example';
import ReaderAuthorLink from 'blocks/reader-author-link/docs/example';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link/docs/example';
import AuthorCompactProfile from 'blocks/author-compact-profile/docs/example';
import RelatedPostCard from 'blocks/reader-related-card/docs/example';
import PlanPrice from 'my-sites/plan-price/docs/example';
import PostShare from 'blocks/post-share/docs/example';
import PlanThankYouCard from 'blocks/plan-thank-you-card/docs/example';
import DismissibleCard from 'blocks/dismissible-card/docs/example';
import PostEditButton from 'blocks/post-edit-button/docs/example';
import PostComment from 'blocks/comments/docs/post-comment-example';
import ReaderAvatar from 'blocks/reader-avatar/docs/example';
import SubscriptionLengthPicker from 'blocks/subscription-length-picker/docs/example';
import ImageEditor from 'blocks/image-editor/docs/example';
import ImageSelector from 'blocks/image-selector/docs/example';
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
import LocationSearch from 'blocks/location-search/docs/example';
import ConversationCommentList from 'blocks/conversations/docs/example';
import SimplePaymentsDialog from 'components/tinymce/plugins/simple-payments/dialog/docs/example';
import ConversationCaterpillar from 'blocks/conversation-caterpillar/docs/example';
import ConversationFollowButton from 'blocks/conversation-follow-button/docs/example';
import ColorSchemePicker from 'blocks/color-scheme-picker/docs/example';
import UserMentions from 'blocks/user-mentions/docs/example';
import SupportArticleDialog from 'blocks/support-article-dialog/docs/example';
import UpsellNudge from 'blocks/upsell-nudge/docs/example';

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
					<DisconnectJetpackDialog />
					<CreditCardForm readmeFilePath="credit-card-form" />
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
					<UpgradeNudge readmeFilePath="upgrade-nudge" />
					<UpgradeNudgeExpanded readmeFilePath="upgrade-nudge-expanded" />
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
					<SimplePaymentsDialog />
					<SubscriptionLengthPicker />
					<ReaderShare readmeFilePath="reader-share" />
					<ConversationCommentList />
					<PostComment />
					<ConversationCaterpillar readmeFilePath="conversation-caterpillar" />
					<ConversationFollowButton />
					{ isEnabled( 'reader/user-mention-suggestions' ) && (
						<UserMentions readmeFilePath="user-mentions" />
					) }
					<SupportArticleDialog />
					<ImageSelector readmeFilePath="image-selector" />
					<UpsellNudge />
				</Collection>
			</Main>
		);
	}
}
