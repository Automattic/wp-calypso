/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import classnames from 'classnames';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import ReadmeViewer from 'components/readme-viewer';
import SearchCard from 'components/search-card';

/**
 * Docs examples
 */
import Accordion from 'components/accordion/docs/example';
import ActionCard from 'components/action-card/docs/example';
import ActionPanel from 'components/action-panel/docs/example';
import Animate from 'components/animate/docs/example';
import BackButton from 'components/back-button/docs/example';
import Badge from 'components/badge/docs/example';
import Banner from 'components/banner/docs/example';
import BulkSelect from 'components/bulk-select/docs/example';
import ButtonGroups from 'components/button-group/docs/example';
import Buttons from '@automattic/components/src/button/docs/example';
import CardHeading from 'components/card-heading/docs/example';
import Cards from '@automattic/components/src/card/docs/example';
import Chart from 'components/chart/docs/example';
import Checklist from 'components/checklist/docs/example';
import ClipboardButtonInput from 'components/clipboard-button-input/docs/example';
import ClipboardButtons from 'components/forms/clipboard-button/docs/example';
import Collection from 'devdocs/design/search-collection';
import ColorSchemePicker from 'blocks/color-scheme-picker/docs/example';
import Count from 'components/count/docs/example';
import CountedTextareas from 'components/forms/counted-textarea/docs/example';
import CreditCard from 'components/credit-card/docs/example';
import DatePicker from 'components/date-picker/docs/example';
import DateRange from 'components/date-range/docs/example';
import DiffViewerExample from 'components/diff-viewer/docs/example';
import DotPager from 'components/dot-pager/docs/example';
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
import FormattedDate from 'components/formatted-date/docs/example';
import FormattedHeader from 'components/formatted-header/docs/example';
import FormFields from 'components/forms/docs/example';
import Gauge from 'components/gauge/docs/example';
import GlobalNotices from 'components/global-notices/docs/example';
import Gravatar from 'components/gravatar/docs/example';
import GravatarCaterpillar from 'components/gravatar-caterpillar/docs/example';
import Gridicon from 'components/gridicon/docs/example';
import GSuiteExamples from 'components/gsuite/docs/example';
import HappinessEngineersTray from 'components/happiness-engineers-tray/docs/example';
import HeaderButton from 'components/header-button/docs/example';
import Headers from 'components/header-cake/docs/example';
import ImagePreloader from 'components/image-preloader/docs/example';
import InfoPopover from 'components/info-popover/docs/example';
import InlineSupportLink from 'components/inline-support-link/docs/example';
import InputChrono from 'components/input-chrono/docs/example';
import JetpackColophonExample from 'components/jetpack-colophon/docs/example';
import JetpackHeaderExample from 'components/jetpack-header/docs/example';
import JetpackLogoExample from 'components/jetpack-logo/docs/example';
import LanguagePicker from 'components/language-picker/docs/example';
import LineChart from 'components/line-chart/docs/example';
import ListEnd from 'components/list-end/docs/example';
import MarkedLinesExample from 'components/marked-lines/docs/example';
import MultipleChoiceQuestionExample from 'components/multiple-choice-question/docs/example';
import Notices from 'components/notice/docs/example';
import PaginationExample from 'components/pagination/docs/example';
import PaymentLogo from 'components/payment-logo/docs/example';
import PieChart from 'components/pie-chart/docs/example';
import PlansSkipButton from 'components/plans/plans-skip-button/docs/example';
import PodcastIndicator from 'components/podcast-indicator/docs/example';
import Popovers from 'components/popover/docs/example';
import ProductCard from 'components/product-card/docs/example';
import ProductExpiration from 'components/product-expiration/docs/example';
import ProductIcon from '@automattic/components/src/product-icon/docs/example';
import ProgressBar from '@automattic/components/src/progress-bar/docs/example';
import PromoSection from 'components/promo-section/docs/example';
import PromoCard from 'components/promo-section/promo-card/docs/example';
import Ranges from 'components/forms/range/docs/example';
import Rating from 'components/rating/docs/example';
import Ribbon from '@automattic/components/src/ribbon/docs/example';
import ScreenReaderTextExample from '@automattic/components/src/screen-reader-text/docs/example';
import SearchDemo from 'components/search/docs/example';
import SectionHeader from 'components/section-header/docs/example';
import SectionNav from 'components/section-nav/docs/example';
import SegmentedControl from 'components/segmented-control/docs/example';
import SelectDropdown from 'components/select-dropdown/docs/example';
import ShareButton from 'components/share-button/docs/example';
import SiteTitleControl from 'components/site-title/docs/example';
import SocialLogos from 'components/social-logo/docs/example';
import Spinner from 'components/spinner/docs/example';
import SpinnerButton from 'components/spinner-button/docs/example';
import SpinnerLine from 'components/spinner-line/docs/example';
import SplitButton from 'components/split-button/docs/example';
import Suggestions from '@automattic/components/src/suggestions/docs/example';
import SuggestionSearchExample from 'components/suggestion-search/docs/example';
import SupportInfoExample from 'components/support-info/docs/example';
import TextareaAutosize from 'components/textarea-autosize/docs/example';
import TextDiff from 'components/text-diff/docs/example';
import TileGrid from 'components/tile-grid/docs/example';
import Timeline from 'components/timeline/docs/example';
import TimeSince from 'components/time-since/docs/example';
import Timezone from 'components/timezone/docs/example';
import TokenFields from 'components/token-field/docs/example';
import Tooltip from 'components/tooltip/docs/example';
import UserItem from 'components/user/docs/example';
import Version from 'components/version/docs/example';
import VerticalMenu from 'components/vertical-menu/docs/example';
import VerticalNav from 'components/vertical-nav/docs/example';
import Wizard from 'components/wizard/docs/example';
import WizardProgressBar from 'components/wizard-progress-bar/docs/example';
import WpcomColophon from 'components/wpcom-colophon/docs/example';

export default class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';
	state = { filter: '' };

	onSearch = term => {
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
					<Accordion readmeFilePath="accordion" />
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
					<CreditCard readmeFilePath="credit-card" />
					<DatePicker readmeFilePath="date-picker" />
					<DateRange readmeFilePath="date-range" />
					<DiffViewerExample readmeFilePath="diff-viewer" />
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
					<JetpackColophonExample readmeFilePath="jetpack-colophon" />
					<JetpackHeaderExample readmeFilePath="jetpack-header" />
					<JetpackLogoExample readmeFilePath="jetpack-logo" />
					<LanguagePicker readmeFilePath="language-picker" />
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
