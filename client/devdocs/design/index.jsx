/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import classnames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import { trim } from 'lodash';
import Gridicons from 'gridicons/example';

/**
 * Internal dependencies
 */
import config from 'config';
import DocumentHead from 'components/data/document-head';
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';
import { isEnabled } from 'config';

/**
 * Docs examples
 */
import ActionCard from 'components/action-card/docs/example';
import Accordions from 'components/accordion/docs/example';
import BackButton from 'components/back-button/docs/example';
import Badge from 'components/badge/docs/example';
import Banner from 'components/banner/docs/example';
import BulkSelect from 'components/bulk-select/docs/example';
import ButtonGroups from 'components/button-group/docs/example';
import Buttons from 'components/button/docs/example';
import Cards from 'components/card/docs/example';
import CardHeading from 'components/card-heading/docs/example';
import Checklist from 'components/checklist/docs/example';
import ClipboardButtonInput from 'components/clipboard-button-input/docs/example';
import ClipboardButtons from 'components/forms/clipboard-button/docs/example';
import Collection from 'devdocs/design/search-collection';
import Count from 'components/count/docs/example';
import CountedTextareas from 'components/forms/counted-textarea/docs/example';
import DatePicker from 'components/date-picker/docs/example';
import DropZones from 'components/drop-zone/docs/example';
import EllipsisMenu from 'components/ellipsis-menu/docs/example';
import EmbedDialog from 'components/tinymce/plugins/embed/docs/example';
import EmojifyExample from 'components/emojify/docs/example';
import EmptyContent from 'components/empty-content/docs/example';
import ExternalLink from 'components/external-link/docs/example';
import FAQ from 'components/faq/docs/example';
import FeatureGate from 'components/feature-example/docs/example';
import FilePickers from 'components/file-picker/docs/example';
import FocusableExample from 'components/focusable/docs/example';
import FoldableCard from 'components/foldable-card/docs/example';
import FormattedHeader from 'components/formatted-header/docs/example';
import FormFields from 'components/forms/docs/example';
import Gauge from 'components/gauge/docs/example';
import GlobalNotices from 'components/global-notices/docs/example';
import Gravatar from 'components/gravatar/docs/example';
import HeaderButton from 'components/header-button/docs/example';
import Headers from 'components/header-cake/docs/example';
import ImagePreloader from 'components/image-preloader/docs/example';
import InfoPopover from 'components/info-popover/docs/example';
import InputChrono from 'components/input-chrono/docs/example';
import JetpackColophonExample from 'components/jetpack-colophon/docs/example';
import JetpackLogoExample from 'components/jetpack-logo/docs/example';
import LanguagePicker from 'components/language-picker/docs/example';
import ListEnd from 'components/list-end/docs/example';
import Notices from 'components/notice/docs/example';
import PaginationExample from 'components/pagination/docs/example';
import PaymentLogo from 'components/payment-logo/docs/example';
import Popovers from 'components/popover/docs/example';
import ProgressBar from 'components/progress-bar/docs/example';
import Ranges from 'components/forms/range/docs/example';
import Rating from 'components/rating/docs/example';
import Ribbon from 'components/ribbon/docs/example';
import ScreenReaderTextExample from 'components/screen-reader-text/docs/example';
import SearchDemo from 'components/search/docs/example';
import SectionHeader from 'components/section-header/docs/example';
import SectionNav from 'components/section-nav/docs/example';
import SegmentedControl from 'components/segmented-control/docs/example';
import SelectDropdown from 'components/select-dropdown/docs/example';
import ShareButton from 'components/share-button/docs/example';
import SiteTitleControl from 'components/site-title/docs/example';
import SocialLogos from 'social-logos/example';
import Spinner from 'components/spinner/docs/example';
import SpinnerButton from 'components/spinner-button/docs/example';
import SpinnerLine from 'components/spinner-line/docs/example';
import SplitButton from 'components/split-button/docs/example';
import Suggestions from 'components/suggestions/docs/example';
import TextDiff from 'components/text-diff/docs/example';
import TileGrid from 'components/tile-grid/docs/example';
import TimeSince from 'components/time-since/docs/example';
import Timezone from 'components/timezone/docs/example';
import TokenFields from 'components/token-field/docs/example';
import Tooltip from 'components/tooltip/docs/example';
import Version from 'components/version/docs/example';
import VerticalMenu from 'components/vertical-menu/docs/example';
import Wizard from 'components/wizard/docs/example';

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

class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';
	state = { filter: '' };

	componentWillMount() {
		if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
			const { dispatchFetchComponentsUsageStats } = this.props;
			dispatchFetchComponentsUsageStats();
		}
	}

	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	backToComponents = () => {
		page( '/devdocs/design/' );
	};

	render() {
		const { componentsUsageStats = {}, component } = this.props;
		const { filter } = this.state;

		const className = classnames( 'devdocs', 'devdocs__components', {
			'is-single': this.props.component,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="UI Components" />

				{ component ? (
					<HeaderCake onClick={ this.backToComponents } backText="All Components">
						{ slugToCamelCase( component ) }
					</HeaderCake>
				) : (
					<SearchCard
						onSearch={ this.onSearch }
						initialValue={ filter }
						placeholder="Search components…"
						analyticsGroup="Docs"
						className="design__ui-components-search"
					/>
				) }

				<Collection component={ component } filter={ filter }>
					<ActionCard readmeFilePath="action-card" />
					<Accordions
						componentUsageStats={ componentsUsageStats.accordion }
						readmeFilePath="accordion"
					/>
					<BackButton readmeFilePath="back-button" />
					<Banner readmeFilePath="banner" />
					<BulkSelect readmeFilePath="bulk-select" />
					<ButtonGroups readmeFilePath="button-group" />
					<Buttons componentUsageStats={ componentsUsageStats.button } readmeFilePath="button" />
					<SplitButton readmeFilePath="split-button" />
					<Badge />
					<Cards readmeFilePath="card" />
					<CardHeading />
					<Checklist />
					<ClipboardButtonInput readmeFilePath="clipboard-button-input" />
					<ClipboardButtons readmeFilePath="forms/clipboard-button" />
					<Count readmeFilePath="count" />
					<CountedTextareas readmeFilePath="forms/counted-textarea" />
					<DatePicker readmeFilePath="date-picker" />
					<DropZones searchKeywords="drag" readmeFilePath="drop-zone" />
					<EllipsisMenu readmeFilePath="ellipsis-menu" />
					<EmbedDialog />
					<EmojifyExample readmeFilePath="emojify" />
					<EmptyContent readmeFilePath="empty-content" />
					<ExternalLink readmeFilePath="external-link" />
					<FAQ readmeFilePath="faq" />
					<FeatureGate readmeFilePath="feature-example" />
					<FilePickers readmeFilePath="file-picker" />
					<FocusableExample readmeFilePath="focusable" />
					<FoldableCard readmeFilePath="foldable-card" />
					<FormattedHeader readmeFilePath="formatted-header" />
					<FormFields searchKeywords="input textbox textarea radio" readmeFilePath="forms" />
					<Gauge readmeFilePath="gauge" />
					<GlobalNotices />
					<Gravatar readmeFilePath="gravatar" />
					<Gridicons />
					<HeaderButton />
					<Headers readmeFilePath="header-cake" />
					<ImagePreloader readmeFilePath="image-preloader" />
					<InfoPopover readmeFilePath="info-popover" />
					<Tooltip readmeFilePath="tooltip" />
					<InputChrono readmeFilePath="input-chrono" />
					<JetpackColophonExample />
					<JetpackLogoExample />
					<LanguagePicker readmeFilePath="language-picker" />
					<ListEnd />
					<Notices />
					<PaginationExample readmeFilePath="pagination" />
					<PaymentLogo readmeFilePath="payment-logo" />
					<Popovers readmeFilePath="popover" />
					<ProgressBar readmeFilePath="progress-bar" />
					<Ranges readmeFilePath="forms/range" />
					<Rating readmeFilePath="rating" />
					<Ribbon />
					<ScreenReaderTextExample />
					<SearchDemo readmeFilePath="search" />
					<SectionHeader readmeFilePath="section-header" />
					<SectionNav readmeFilePath="section-nav" />
					<SegmentedControl readmeFilePath="segmented-control" />
					<SelectDropdown searchKeywords="menu" readmeFilePath="select-dropdown" />
					<ShareButton />
					<SiteTitleControl readmeFilePath="site-title" />
					<SocialLogos />
					<Spinner searchKeywords="loading" readmeFilePath="spinner" />
					<SpinnerButton searchKeywords="loading input submit" readmeFilePath="spinner-button" />
					<SpinnerLine searchKeywords="loading" readmeFilePath="spinner-line" />
					<Suggestions />
					<TextDiff />
					<TileGrid />
					<TimeSince />
					<Timezone readmeFilePath="timezone" />
					<TokenFields readmeFilePath="token-field" />
					<VerticalMenu readmeFilePath="vertical-menu" />
					<Version readmeFilePath="version" />
					<Wizard />

					<AuthorSelector readmeFilePath="author-selector" />
					<CalendarButton readmeFilePath="calendar-button" />
					<CalendarPopover readmeFilePath="calendar-popover" />
					<CommentButtons readmeFilePath="comment-button" />
					<DisconnectJetpackDialog />
					<CreditCardForm readmeFilePath="credit-card-form" />
					<FollowButton readmeFilePath="follow-button" />
					<FollowMenu readmeFilePath="follow-menu" />
					<HappinessSupport />
					<ImageEditor readmeFilePath="image-editor" />
					<VideoEditor readmeFilePath="video-editor" />
					<LikeButtons readmeFilePath="like-button" />
					<Login />
					<PostEditButton />
					<PlanStorage readmeFilePath="plan-storage" />
					<PostSchedule />
					<PostSelector />
					<AllSites />
					<Site readmeFilePath="site" />
					<SitePlaceholder />
					<SitesDropdown />
					<SiteIcon readmeFilePath="site-icon" />
					<Theme />
					<ThemesListExample />
					<UpgradeNudge readmeFilePath="upgrade-nudge-expanded" />
					<PlanCompareCard />
					<FeatureComparison />
					<DomainTip />
					<RelatedPostCard />
					<PostItem readmeFilePath="post-item" />
					<PostStatus readmeFilePath="post-status" />
					<PostTime readmeFilePath="post-time" />
					<ReaderAuthorLink readmeFilePath="reader-author-link" />
					<ReaderSubscriptionListItem />
					<ReaderSiteStreamLink readmeFilePath="reader-site-stream-link" />
					<ReaderFullPostHeader />
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
					<ReaderShare readmeFilePath="reader-share" />
					<ReaderEmailSettings readmeFilePath="reader-email-settings" />
					<UploadImage readmeFilePath="upload-image" />
					<ConversationCommentList />
					<PostComment />
					<ConversationCaterpillar readmeFilePath="conversation-caterpillar" />
					<ConversationFollowButton />
					<ColorSchemePicker readmeFilePath="color-scheme-picker" />
					{ isEnabled( 'site-address-editor/devdocs' ) && <SiteRenamer /> }
				</Collection>
			</Main>
		);
	}
}

if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
	const mapStateToProps = state => {
		const { componentsUsageStats } = state;

		return componentsUsageStats;
	};

	const mapDispatchToProps = dispatch => {
		return bindActionCreators(
			{
				dispatchFetchComponentsUsageStats: fetchComponentsUsageStats,
			},
			dispatch
		);
	};

	DesignAssets.propTypes = {
		componentsUsageStats: PropTypes.object,
		isFetching: PropTypes.bool,
		dispatchFetchComponentsUsageStats: PropTypes.func,
	};

	DesignAssets = connect( mapStateToProps, mapDispatchToProps )( DesignAssets );
}

export default DesignAssets;
