import page from '@automattic/calypso-router';
import { Gravatar, SpinnerExample as Spinner } from '@automattic/components';
import Badge from '@automattic/components/src/badge/docs/example';
import Buttons from '@automattic/components/src/button/docs/example';
import Cards from '@automattic/components/src/card/docs/example';
import Count from '@automattic/components/src/count/docs/example';
import DotPager from '@automattic/components/src/dot-pager/docs/example';
import ExternalLink from '@automattic/components/src/external-link/docs/example';
import FoldableCard from '@automattic/components/src/foldable-card/docs/example';
import Gridicon from '@automattic/components/src/gridicon/docs/example';
import ProductLogoExample from '@automattic/components/src/logos/docs/example';
import ProductIcon from '@automattic/components/src/product-icon/docs/example';
import ProgressBar from '@automattic/components/src/progress-bar/docs/example';
import Ribbon from '@automattic/components/src/ribbon/docs/example';
import ScreenReaderTextExample from '@automattic/components/src/screen-reader-text/docs/example';
import SegmentedControl from '@automattic/components/src/segmented-control/docs/example';
import SelectDropdown from '@automattic/components/src/select-dropdown/docs/example';
import SiteThumbnail from '@automattic/components/src/site-thumbnail/docs/example';
import Suggestions from '@automattic/components/src/suggestions/docs/example';
import Swipeable from '@automattic/components/src/swipeable/docs/example';
import Tooltip from '@automattic/components/src/tooltip/docs/example';
import clsx from 'clsx';
import { trim } from 'lodash';
import { Component, Fragment } from 'react';
import JetpackReviewPromptExample from 'calypso/blocks/jetpack-review-prompt/docs/example';
import ActionCard from 'calypso/components/action-card/docs/example';
import ActionPanel from 'calypso/components/action-panel/docs/example';
import Animate from 'calypso/components/animate/docs/example';
import BackButton from 'calypso/components/back-button/docs/example';
import Banner from 'calypso/components/banner/docs/example';
import Breadcrumb from 'calypso/components/breadcrumb/docs/example';
import BulkSelect from 'calypso/components/bulk-select/docs/example';
import ButtonGroups from 'calypso/components/button-group/docs/example';
import CardHeading from 'calypso/components/card-heading/docs/example';
import CategoryPillNavigationExample from 'calypso/components/category-pill-navigation/docs/example';
import Chart from 'calypso/components/chart/docs/example';
import Checklist from 'calypso/components/checklist/docs/example';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input/docs/example';
import DocumentHead from 'calypso/components/data/document-head';
import DatePicker from 'calypso/components/date-picker/docs/example';
import DateRange from 'calypso/components/date-range/docs/example';
import DiffViewerExample from 'calypso/components/diff-viewer/docs/example';
import DropZones from 'calypso/components/drop-zone/docs/example';
import EllipsisMenu from 'calypso/components/ellipsis-menu/docs/example';
import EmptyContent from 'calypso/components/empty-content/docs/example';
import FAQ from 'calypso/components/faq/docs/example';
import FeatureGate from 'calypso/components/feature-example/docs/example';
import FeatureItem from 'calypso/components/feature-item/docs/example';
import FilePickers from 'calypso/components/file-picker/docs/example';
import FoldableFAQ from 'calypso/components/foldable-faq/docs/example';
import FormattedDate from 'calypso/components/formatted-date/docs/example';
import FormattedHeader from 'calypso/components/formatted-header/docs/example';
import ClipboardButtons from 'calypso/components/forms/clipboard-button/docs/example';
import CountedTextareas from 'calypso/components/forms/counted-textarea/docs/example';
import FormFields from 'calypso/components/forms/docs/example';
import Ranges from 'calypso/components/forms/range/docs/example';
import GlobalNotices from 'calypso/components/global-notices/docs/example';
import GravatarCaterpillar from 'calypso/components/gravatar-caterpillar/docs/example';
import HappinessEngineersTray from 'calypso/components/happiness-engineers-tray/docs/example';
import HeaderCake from 'calypso/components/header-cake';
import Headers from 'calypso/components/header-cake/docs/example';
import ImagePreloader from 'calypso/components/image-preloader/docs/example';
import InfoPopover from 'calypso/components/info-popover/docs/example';
import InlineSupportLink from 'calypso/components/inline-support-link/docs/example';
import InputChrono from 'calypso/components/input-chrono/docs/example';
import JetpackColophonExample from 'calypso/components/jetpack-colophon/docs/example';
import JetpackHeaderExample from 'calypso/components/jetpack-header/docs/example';
import JetpackLogoExample from 'calypso/components/jetpack-logo/docs/example';
import LanguagePicker from 'calypso/components/language-picker/docs/example';
import LayoutExample from 'calypso/components/layout/docs/example';
import LineChart from 'calypso/components/line-chart/docs/example';
import LinkCard from 'calypso/components/link-card/docs/example';
import ListEnd from 'calypso/components/list-end/docs/example';
import Main from 'calypso/components/main';
import MarkedLinesExample from 'calypso/components/marked-lines/docs/example';
import { MasonryGridExample } from 'calypso/components/masonry-grid/docs/example';
import MultipleChoiceQuestionExample from 'calypso/components/multiple-choice-question/docs/example';
import NavigationHeader from 'calypso/components/navigation-header/docs/example';
import Notices from 'calypso/components/notice/docs/example';
import PaginationExample from 'calypso/components/pagination/docs/example';
import PaymentLogo from 'calypso/components/payment-logo/docs/example';
import PieChart from 'calypso/components/pie-chart/docs/example';
import PodcastIndicator from 'calypso/components/podcast-indicator/docs/example';
import Popovers from 'calypso/components/popover-menu/docs/example';
import ProductCard from 'calypso/components/product-card/docs/example';
import ProductExpiration from 'calypso/components/product-expiration/docs/example';
import PromoSection from 'calypso/components/promo-section/docs/example';
import PromoCard from 'calypso/components/promo-section/promo-card/docs/example';
import Rating from 'calypso/components/rating/docs/example';
import ReadmeViewer from 'calypso/components/readme-viewer';
import SearchDemo from 'calypso/components/search/docs/example';
import SearchCard from 'calypso/components/search-card';
import Section from 'calypso/components/section/docs/example';
import SectionHeader from 'calypso/components/section-header/docs/example';
import SectionNav from 'calypso/components/section-nav/docs/example';
import ShareButton from 'calypso/components/share-button/docs/example';
import SocialLogos from 'calypso/components/social-logo/docs/example';
import SpinnerButton from 'calypso/components/spinner-button/docs/example';
import SpinnerLine from 'calypso/components/spinner-line/docs/example';
import SplitButton from 'calypso/components/split-button/docs/example';
import Spotlight from 'calypso/components/spotlight/docs/example';
import StepProgress from 'calypso/components/step-progress/docs/example';
import SuggestionSearchExample from 'calypso/components/suggestion-search/docs/example';
import SupportInfoExample from 'calypso/components/support-info/docs/example';
import TextDiff from 'calypso/components/text-diff/docs/example';
import TextareaAutosize from 'calypso/components/textarea-autosize/docs/example';
import TileGrid from 'calypso/components/tile-grid/docs/example';
import TimeSince from 'calypso/components/time-since/docs/example';
import Timeline from 'calypso/components/timeline/docs/example';
import Timezone from 'calypso/components/timezone/docs/example';
import TokenFields from 'calypso/components/token-field/docs/example';
import UserItem from 'calypso/components/user/docs/example';
import VerticalMenu from 'calypso/components/vertical-menu/docs/example';
import VerticalNav from 'calypso/components/vertical-nav/docs/example';
import Wizard from 'calypso/components/wizard/docs/example';
import Collection from 'calypso/devdocs/design/search-collection';
import { slugToCamelCase } from 'calypso/devdocs/docs-example/util';
import SitesGridItemExample from 'calypso/sites-dashboard/components/sites-grid-item/docs/example';

export default class DesignAssets extends Component {
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

		const className = clsx( 'devdocs', 'devdocs__components', {
			'is-single': this.props.component,
			'is-list': ! this.props.component,
		} );

		return (
			<Main className={ className }>
				<DocumentHead title="UI Components" />

				{ component ? (
					<Fragment>
						<HeaderCake onClick={ this.backToComponents } backText="All Components">
							{ slugToCamelCase( component ) }
						</HeaderCake>
					</Fragment>
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
					<ActionCard readmeFilePath="action-card" />
					<ActionPanel readmeFilePath="action-panel" />
					<Animate readmeFilePath="animate" />
					<BackButton readmeFilePath="back-button" />
					<Badge readmeFilePath="badge" />
					<Banner readmeFilePath="banner" />
					<Breadcrumb searchKeywords="navigation" readmeFilePath="breadcrumb" />
					<BulkSelect readmeFilePath="bulk-select" />
					<ButtonGroups readmeFilePath="button-group" />
					<Buttons readmeFilePath="/packages/components/src/button" />
					<CardHeading readmeFilePath="card-heading" />
					<Cards readmeFilePath="/packages/components/src/card" />
					<CategoryPillNavigationExample readmeFilePath="category-pill-navigation" />
					<Chart readmeFilePath="chart" />
					<Checklist readmeFilePath="checklist" />
					<ClipboardButtonInput readmeFilePath="clipboard-button-input" />
					<ClipboardButtons readmeFilePath="forms/clipboard-button" />
					<Count readmeFilePath="count" />
					<CountedTextareas readmeFilePath="forms/counted-textarea" />
					<DatePicker readmeFilePath="date-picker" />
					<DateRange readmeFilePath="date-range" />
					<DiffViewerExample readmeFilePath="diff-viewer" />
					<DotPager readmeFilePath="dot-pager" />
					<Swipeable readmeFilePath="swipeable" />
					<DropZones searchKeywords="drag" readmeFilePath="drop-zone" />
					<EllipsisMenu readmeFilePath="ellipsis-menu" />
					<EmptyContent readmeFilePath="empty-content" />
					<ExternalLink readmeFilePath="external-link" />
					<FAQ readmeFilePath="faq" />
					<FeatureGate readmeFilePath="feature-example" />
					<FeatureItem readmeFilePath="feature-item" />
					<FilePickers readmeFilePath="file-picker" />
					<FoldableCard readmeFilePath="foldable-card" searchKeywords="accordion" />
					<FoldableFAQ readmeFilePath="foldable-faq" />
					<FormattedDate readmeFilePath="formatted-date" />
					<FormattedHeader readmeFilePath="formatted-header" />
					<FormFields searchKeywords="input textbox textarea radio" readmeFilePath="forms" />
					<GlobalNotices readmeFilePath="global-notices" />
					<Gravatar readmeFilePath="gravatar" />
					<GravatarCaterpillar readmeFilePath="gravatar-caterpillar" />
					<Gridicon />
					<HappinessEngineersTray readmeFilePath="happiness-engineers-tray" />
					<Headers readmeFilePath="header-cake" />
					<ImagePreloader readmeFilePath="image-preloader" />
					<InfoPopover readmeFilePath="info-popover" />
					<InlineSupportLink readmeFilePath="inline-support-link" />
					<InputChrono readmeFilePath="input-chrono" />
					<JetpackColophonExample readmeFilePath="jetpack-colophon" />
					<JetpackHeaderExample readmeFilePath="jetpack-header" />
					<JetpackLogoExample readmeFilePath="jetpack-logo" />
					<JetpackReviewPromptExample readmeFilePath="jetpack/jetpack-review-prompt" />
					<LanguagePicker readmeFilePath="language-picker" />
					<LayoutExample readmeFilePath="layout" />
					<LineChart readmeFilePath="line-chart" />
					<LinkCard readmeFilePath="link-card" />
					<ListEnd readmeFilePath="list-end" />
					<ProductLogoExample />
					<MarkedLinesExample readmeFilePath="marked-lines" />
					<MultipleChoiceQuestionExample readmeFilePath="multiple-choice-question" />
					<NavigationHeader readmeFilePath="navigation-header" />
					<Notices readmeFilePath="notice" />
					<PaginationExample readmeFilePath="pagination" />
					<PaymentLogo readmeFilePath="payment-logo" />
					<PieChart readmeFilePath="pie-chart" />
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
					<Section readmeFilePath="section" />
					<SectionHeader readmeFilePath="section-header" />
					<SectionNav readmeFilePath="section-nav" />
					<SegmentedControl readmeFilePath="segmented-control" />
					<SelectDropdown searchKeywords="menu" readmeFilePath="select-dropdown" />
					<ShareButton readmeFilePath="share-button" />
					<SocialLogos />
					<Spinner searchKeywords="loading" readmeFilePath="spinner" />
					<SpinnerButton searchKeywords="loading input submit" readmeFilePath="spinner-button" />
					<SpinnerLine searchKeywords="loading" readmeFilePath="spinner-line" />
					<SplitButton readmeFilePath="split-button" />
					<Spotlight />
					<SiteThumbnail readmeFilePath="/packages/components/src/site-thumbnail" />
					<SitesGridItemExample readmeFilePath="/client/sites-dashboard/components/sites-grid-item" />
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
					<VerticalMenu readmeFilePath="vertical-menu" />
					<VerticalNav readmeFilePath="vertical-nav" />
					<Wizard readmeFilePath="wizard" />
					<MasonryGridExample readmeFilePath="masonry-grid" />
				</Collection>
			</Main>
		);
	}
}
