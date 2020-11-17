/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import classnames from 'classnames';
import { slugToCamelCase } from 'calypso/devdocs/docs-example/util';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import ReadmeViewer from 'calypso/components/readme-viewer';
import SearchCard from 'calypso/components/search-card';

/**
 * Docs examples
 */
import ActionCard from 'calypso/components/action-card/docs/example';
import ActionPanel from 'calypso/components/action-panel/docs/example';
import Animate from 'calypso/components/animate/docs/example';
import BackButton from 'calypso/components/back-button/docs/example';
import Badge from 'calypso/components/badge/docs/example';
import Banner from 'calypso/components/banner/docs/example';
import BulkSelect from 'calypso/components/bulk-select/docs/example';
import ButtonGroups from 'calypso/components/button-group/docs/example';
import Buttons from '@automattic/components/src/button/docs/example';
import CardHeading from 'calypso/components/card-heading/docs/example';
import Cards from '@automattic/components/src/card/docs/example';
import Chart from 'calypso/components/chart/docs/example';
import Checklist from 'calypso/components/checklist/docs/example';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input/docs/example';
import ClipboardButtons from 'calypso/components/forms/clipboard-button/docs/example';
import Collection from 'calypso/devdocs/design/search-collection';
import ColorSchemePicker from 'calypso/blocks/color-scheme-picker/docs/example';
import Count from 'calypso/components/count/docs/example';
import CountedTextareas from 'calypso/components/forms/counted-textarea/docs/example';
import DatePicker from 'calypso/components/date-picker/docs/example';
import DateRange from 'calypso/components/date-range/docs/example';
import DiffViewerExample from 'calypso/components/diff-viewer/docs/example';
import Disableable from 'calypso/components/disableable/docs/example';
import DotPager from 'calypso/components/dot-pager/docs/example';
import DropZones from 'calypso/components/drop-zone/docs/example';
import EllipsisMenu from 'calypso/components/ellipsis-menu/docs/example';
import EmbedDialog from 'calypso/components/tinymce/plugins/embed/docs/example';
import EmojifyExample from 'calypso/components/emojify/docs/example';
import EmptyContent from 'calypso/components/empty-content/docs/example';
import ExternalLink from 'calypso/components/external-link/docs/example';
import FAQ from 'calypso/components/faq/docs/example';
import FeatureGate from 'calypso/components/feature-example/docs/example';
import FilePickers from 'calypso/components/file-picker/docs/example';
import FocusableExample from 'calypso/components/focusable/docs/example';
import FoldableCard from 'calypso/components/foldable-card/docs/example';
import FoldableFAQ from 'calypso/components/foldable-faq/docs/example';
import FormattedDate from 'calypso/components/formatted-date/docs/example';
import FormattedHeader from 'calypso/components/formatted-header/docs/example';
import FormFields from 'calypso/components/forms/docs/example';
import Gauge from 'calypso/components/gauge/docs/example';
import GlobalNotices from 'calypso/components/global-notices/docs/example';
import Gravatar from 'calypso/components/gravatar/docs/example';
import GravatarCaterpillar from 'calypso/components/gravatar-caterpillar/docs/example';
import Gridicon from 'calypso/components/gridicon/docs/example';
import GSuiteExamples from 'calypso/components/gsuite/docs/example';
import HappinessEngineersTray from 'calypso/components/happiness-engineers-tray/docs/example';
import HeaderButton from 'calypso/components/header-button/docs/example';
import Headers from 'calypso/components/header-cake/docs/example';
import ImagePreloader from 'calypso/components/image-preloader/docs/example';
import InfoPopover from 'calypso/components/info-popover/docs/example';
import InlineSupportLink from 'calypso/components/inline-support-link/docs/example';
import InputChrono from 'calypso/components/input-chrono/docs/example';
import JetpackColophonExample from 'calypso/components/jetpack-colophon/docs/example';
import JetpackBundleCard from 'calypso/components/jetpack/card/jetpack-bundle-card/docs/example';
import JetpackHeaderExample from 'calypso/components/jetpack-header/docs/example';
import JetpackLogoExample from 'calypso/components/jetpack-logo/docs/example';
import JetpackPlanCard from 'calypso/components/jetpack/card/jetpack-plan-card/docs/example';
import JetpackProductCard from 'calypso/components/jetpack/card/jetpack-product-card/docs/example';
import JetpackProductSlideOutCard from 'calypso/components/jetpack/card/jetpack-product-slide-out-card/docs/example';
import LanguagePicker from 'calypso/components/language-picker/docs/example';
import LayoutExample from 'calypso/components/layout/docs/example';
import LineChart from 'calypso/components/line-chart/docs/example';
import ListEnd from 'calypso/components/list-end/docs/example';
import MarkedLinesExample from 'calypso/components/marked-lines/docs/example';
import MultipleChoiceQuestionExample from 'calypso/components/multiple-choice-question/docs/example';
import Notices from 'calypso/components/notice/docs/example';
import PaginationExample from 'calypso/components/pagination/docs/example';
import PaymentLogo from 'calypso/components/payment-logo/docs/example';
import PieChart from 'calypso/components/pie-chart/docs/example';
import PlansSkipButton from 'calypso/components/plans/plans-skip-button/docs/example';
import PodcastIndicator from 'calypso/components/podcast-indicator/docs/example';
import Popovers from 'calypso/components/popover/docs/example';
import ProductCard from 'calypso/components/product-card/docs/example';
import ProductExpiration from 'calypso/components/product-expiration/docs/example';
import ProductIcon from '@automattic/components/src/product-icon/docs/example';
import ProgressBar from '@automattic/components/src/progress-bar/docs/example';
import PromoSection from 'calypso/components/promo-section/docs/example';
import PromoCard from 'calypso/components/promo-section/promo-card/docs/example';
import Ranges from 'calypso/components/forms/range/docs/example';
import Rating from 'calypso/components/rating/docs/example';
import Ribbon from '@automattic/components/src/ribbon/docs/example';
import ScreenReaderTextExample from '@automattic/components/src/screen-reader-text/docs/example';
import SearchDemo from 'calypso/components/search/docs/example';
import SectionHeader from 'calypso/components/section-header/docs/example';
import SectionNav from 'calypso/components/section-nav/docs/example';
import SegmentedControl from 'calypso/components/segmented-control/docs/example';
import SelectDropdown from 'calypso/components/select-dropdown/docs/example';
import ShareButton from 'calypso/components/share-button/docs/example';
import SiteTitleControl from 'calypso/components/site-title/docs/example';
import SocialLogos from 'calypso/components/social-logo/docs/example';
import Spinner from 'calypso/components/spinner/docs/example';
import SpinnerButton from 'calypso/components/spinner-button/docs/example';
import SpinnerLine from 'calypso/components/spinner-line/docs/example';
import SplitButton from 'calypso/components/split-button/docs/example';
import StepProgress from 'calypso/components/step-progress/docs/example';
import Suggestions from '@automattic/components/src/suggestions/docs/example';
import SuggestionSearchExample from 'calypso/components/suggestion-search/docs/example';
import SupportInfoExample from 'calypso/components/support-info/docs/example';
import TextareaAutosize from 'calypso/components/textarea-autosize/docs/example';
import TextDiff from 'calypso/components/text-diff/docs/example';
import TileGrid from 'calypso/components/tile-grid/docs/example';
import Timeline from 'calypso/components/timeline/docs/example';
import TimeSince from 'calypso/components/time-since/docs/example';
import Timezone from 'calypso/components/timezone/docs/example';
import TokenFields from 'calypso/components/token-field/docs/example';
import Tooltip from 'calypso/components/tooltip/docs/example';
import UserItem from 'calypso/components/user/docs/example';
import Version from 'calypso/components/version/docs/example';
import VerticalMenu from 'calypso/components/vertical-menu/docs/example';
import VerticalNav from 'calypso/components/vertical-nav/docs/example';
import Wizard from 'calypso/components/wizard/docs/example';
import WizardProgressBar from 'calypso/components/wizard-progress-bar/docs/example';
import WpcomColophon from 'calypso/components/wpcom-colophon/docs/example';

export default class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';
	state = { filter: '' };

	onSearch = ( term ) => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};

	backToComponents = () => {
		page( '/devdocs/design/' );
	};

	render() {
		const { component } = this.props;
		const { filter } = this.state;

		const className = classnames( 'devdocs', 'devdocs__components', {
			'is-single': this.props.component,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="UI Components" />

				{ component ? (
					<React.Fragment>
						<HeaderCake onClick={ this.backToComponents } backText="All Components">
							{ slugToCamelCase( component ) }
						</HeaderCake>
						{ config.isEnabled( 'devdocs/color-scheme-picker' ) && (
							<ColorSchemePicker readmeFilePath="color-scheme-picker" />
						) }
					</React.Fragment>
				) : (
					<div>
						<ReadmeViewer readmeFilePath="/client/devdocs/design/README.md" />
						<SearchCard
							onSearch={ this.onSearch }
							initialValue={ filter }
							placeholder="Search components…"
							analyticsGroup="Docs"
							className="design__ui-components-search"
						/>
					</div>
				) }

				<Collection component={ component } filter={ filter }>
					{ config.isEnabled( 'devdocs/color-scheme-picker' ) && (
						<ColorSchemePicker readmeFilePath="color-scheme-picker" />
					) }
					<ActionCard readmeFilePath="action-card" />
					<ActionPanel readmeFilePath="action-panel" />
					<Animate readmeFilePath="animate" />
					<BackButton readmeFilePath="back-button" />
					<Badge readmeFilePath="badge" />
					<Banner readmeFilePath="banner" />
					<BulkSelect readmeFilePath="bulk-select" />
					<ButtonGroups readmeFilePath="button-group" />
					<Buttons readmeFilePath="/packages/components/src/button" />
					<CardHeading readmeFilePath="card-heading" />
					<Cards readmeFilePath="/packages/components/src/card" />
					<Chart readmeFilePath="chart" />
					<Checklist readmeFilePath="checklist" />
					<ClipboardButtonInput readmeFilePath="clipboard-button-input" />
					<ClipboardButtons readmeFilePath="forms/clipboard-button" />
					<Count readmeFilePath="count" />
					<CountedTextareas readmeFilePath="forms/counted-textarea" />
					<DatePicker readmeFilePath="date-picker" />
					<DateRange readmeFilePath="date-range" />
					<DiffViewerExample readmeFilePath="diff-viewer" />
					<Disableable readmeFilePath="disableable" />
					<DotPager readmeFilePath="dot-pager" />
					<DropZones searchKeywords="drag" readmeFilePath="drop-zone" />
					<EllipsisMenu readmeFilePath="ellipsis-menu" />
					<EmbedDialog readmeFilePath="tinymce/plugins/embed" />
					<EmojifyExample readmeFilePath="emojify" />
					<EmptyContent readmeFilePath="empty-content" />
					<ExternalLink readmeFilePath="external-link" />
					<FAQ readmeFilePath="faq" />
					<FeatureGate readmeFilePath="feature-example" />
					<FilePickers readmeFilePath="file-picker" />
					<FocusableExample readmeFilePath="focusable" />
					<FoldableCard readmeFilePath="foldable-card" />
					<FoldableFAQ readmeFilePath="foldable-faq" />
					<FormattedDate readmeFilePath="formatted-date" />
					<FormattedHeader readmeFilePath="formatted-header" />
					<FormFields searchKeywords="input textbox textarea radio" readmeFilePath="forms" />
					<Gauge readmeFilePath="gauge" />
					<GlobalNotices readmeFilePath="global-notices" />
					<Gravatar readmeFilePath="gravatar" />
					<GravatarCaterpillar readmeFilePath="gravatar-caterpillar" />
					<Gridicon />
					<GSuiteExamples readmeFilePath="gsuite" />
					<HappinessEngineersTray readmeFilePath="happiness-engineers-tray" />
					<HeaderButton readmeFilePath="header-button" />
					<Headers readmeFilePath="header-cake" />
					<ImagePreloader readmeFilePath="image-preloader" />
					<InfoPopover readmeFilePath="info-popover" />
					<InlineSupportLink readmeFilePath="inline-support-link" />
					<InputChrono readmeFilePath="input-chrono" />
					<JetpackBundleCard readmeFilePath="jetpack-bundle-card" />
					<JetpackColophonExample readmeFilePath="jetpack-colophon" />
					<JetpackHeaderExample readmeFilePath="jetpack-header" />
					<JetpackLogoExample readmeFilePath="jetpack-logo" />
					<JetpackPlanCard readmeFilePath="jetpack-plan-card" />
					<JetpackProductCard readmeFilePath="jetpack-product-card" />
					<JetpackProductSlideOutCard readmeFilePath="jetpack-product-slide-out-card" />
					<LanguagePicker readmeFilePath="language-picker" />
					<LayoutExample readmeFilePath="layout" />
					<LineChart readmeFilePath="line-chart" />
					<ListEnd readmeFilePath="list-end" />
					<MarkedLinesExample readmeFilePath="marked-lines" />
					<MultipleChoiceQuestionExample readmeFilePath="multiple-choice-question" />
					<Notices readmeFilePath="notice" />
					<PaginationExample readmeFilePath="pagination" />
					<PaymentLogo readmeFilePath="payment-logo" />
					<PieChart readmeFilePath="pie-chart" />
					<PlansSkipButton readmeFilePath="plans/plans-skip-button" />
					<PodcastIndicator readmeFilePath="podcast-indicator" />
					<Popovers readmeFilePath="popover" />
					<ProductCard readmeFilePath="product-card" />
					<ProductExpiration readmeFilePath="product-expiration" />
					<ProductIcon readmeFilePath="/packages/components/src/product-icon" />
					<ProgressBar readmeFilePath="/packages/components/src/progress-bar" />
					<PromoCard readmeFilePath="promo-section/promo-card" />
					<PromoSection readmeFilePath="promo-section" />
					<Ranges readmeFilePath="forms/range" />
					<Rating readmeFilePath="rating" />
					<Ribbon readmeFilePath="/packages/components/src/ribbon" />
					<ScreenReaderTextExample readmeFilePath="/packages/components/src/screen-reader-text" />
					<SearchDemo readmeFilePath="search" />
					<SectionHeader readmeFilePath="section-header" />
					<SectionNav readmeFilePath="section-nav" />
					<SegmentedControl readmeFilePath="segmented-control" />
					<SelectDropdown searchKeywords="menu" readmeFilePath="select-dropdown" />
					<ShareButton readmeFilePath="share-button" />
					<SiteTitleControl readmeFilePath="site-title" />
					<SocialLogos />
					<Spinner searchKeywords="loading" readmeFilePath="spinner" />
					<SpinnerButton searchKeywords="loading input submit" readmeFilePath="spinner-button" />
					<SpinnerLine searchKeywords="loading" readmeFilePath="spinner-line" />
					<SplitButton readmeFilePath="split-button" />
					<StepProgress readmeFilePath="step-progress" />
					<Suggestions readmeFilePath="/packages/components/src/suggestions" />
					<SuggestionSearchExample />
					<SupportInfoExample />
					<TextareaAutosize readmeFilePath="textarea-autosize" />
					<TextDiff readmeFilePath="text-diff" />
					<TileGrid readmeFilePath="tile-grid" />
					<Timeline readmeFilePath="timeline" />
					<TimeSince readmeFilePath="time-since" />
					<Timezone readmeFilePath="timezone" />
					<TokenFields readmeFilePath="token-field" />
					<Tooltip readmeFilePath="tooltip" />
					<UserItem readmeFilePath="user" />
					<Version readmeFilePath="version" />
					<VerticalMenu readmeFilePath="vertical-menu" />
					<VerticalNav readmeFilePath="vertical-nav" />
					<Wizard readmeFilePath="wizard" />
					<WizardProgressBar readmeFilePath="wizard-progress-bar" />
					<WpcomColophon readmeFilePath="wpcom-colophon" />
				</Collection>
			</Main>
		);
	}
}
