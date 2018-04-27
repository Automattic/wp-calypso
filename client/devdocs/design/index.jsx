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
import ReadmeViewer from 'components/readme-viewer';
import SearchCard from 'components/search-card';

/**
 * Docs examples
 */
import Accordions from 'components/accordion/docs/example';
import ActionCard from 'components/action-card/docs/example';
import Animate from 'components/animate/docs/example';
import BackButton from 'components/back-button/docs/example';
import Badge from 'components/badge/docs/example';
import Banner from 'components/banner/docs/example';
import BulkSelect from 'components/bulk-select/docs/example';
import ButtonGroups from 'components/button-group/docs/example';
import Buttons from 'components/button/docs/example';
import CardHeading from 'components/card-heading/docs/example';
import Cards from 'components/card/docs/example';
import Chart from 'components/chart/docs/example';
import ClipboardButtonInput from 'components/clipboard-button-input/docs/example';
import ClipboardButtons from 'components/forms/clipboard-button/docs/example';
import Collection from 'devdocs/design/search-collection';
import Count from 'components/count/docs/example';
import CountedTextareas from 'components/forms/counted-textarea/docs/example';
import DatePicker from 'components/date-picker/docs/example';
import DiffViewerExample from 'components/diff-viewer/docs/example';
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
import LineChart from 'components/line-chart/docs/example';
import ListEnd from 'components/list-end/docs/example';
import MarkedLinesExample from 'components/marked-lines/docs/example';
import Notices from 'components/notice/docs/example';
import PaginationExample from 'components/pagination/docs/example';
import PaymentLogo from 'components/payment-logo/docs/example';
import PieChart from 'components/pie-chart/docs/example';
import PlansSkipButton from 'components/plans/plans-skip-button/docs/example';
import PodcastIndicator from 'components/podcast-indicator/docs/example';
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
import TextareaAutosize from 'components/textarea-autosize/docs/example';
import TextDiff from 'components/text-diff/docs/example';
import TileGrid from 'components/tile-grid/docs/example';
import TimeSince from 'components/time-since/docs/example';
import Timezone from 'components/timezone/docs/example';
import TokenFields from 'components/token-field/docs/example';
import Tooltip from 'components/tooltip/docs/example';
import Version from 'components/version/docs/example';
import VerticalMenu from 'components/vertical-menu/docs/example';
import VerticalNav from 'components/vertical-nav/docs/example';
import Wizard from 'components/wizard/docs/example';

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
					<div>
						<ReadmeViewer readmeFilePath="components" />
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
					<Accordions
						componentUsageStats={ componentsUsageStats.accordion }
						readmeFilePath="accordion"
					/>
					<Animate readmeFilePath="animate" />
					<BackButton readmeFilePath="back-button" />
					<Badge readmeFilePath="badge" />
					<Banner readmeFilePath="banner" />
					<BulkSelect readmeFilePath="bulk-select" />
					<ButtonGroups readmeFilePath="button-group" />
					<Buttons componentUsageStats={ componentsUsageStats.button } readmeFilePath="button" />
					<SplitButton readmeFilePath="split-button" />
					<Cards readmeFilePath="card" />
					<CardHeading readmeFilePath="card-heading" />
					<Chart readmeFilePath="chart" />
					<ClipboardButtonInput readmeFilePath="clipboard-button-input" />
					<ClipboardButtons readmeFilePath="forms/clipboard-button" />
					<Count readmeFilePath="count" />
					<CountedTextareas readmeFilePath="forms/counted-textarea" />
					<DatePicker readmeFilePath="date-picker" />
					<DiffViewerExample readmeFilePath="diff-viewer" />
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
					<FormattedHeader readmeFilePath="formatted-header" />
					<FormFields searchKeywords="input textbox textarea radio" readmeFilePath="forms" />
					<Gauge readmeFilePath="gauge" />
					<GlobalNotices readmeFilePath="global-notices" />
					<Gravatar readmeFilePath="gravatar" />
					<Gridicons />
					<HeaderButton readmeFilePath="header-button" />
					<Headers readmeFilePath="header-cake" />
					<ImagePreloader readmeFilePath="image-preloader" />
					<InfoPopover readmeFilePath="info-popover" />
					<InputChrono readmeFilePath="input-chrono" />
					<JetpackColophonExample readmeFilePath="jetpack-colophon" />
					<JetpackLogoExample readmeFilePath="jetpack-logo" />
					<LanguagePicker readmeFilePath="language-picker" />
					<LineChart />
					<ListEnd readmeFilePath="list-end" />
					<MarkedLinesExample readmeFilePath="marked-lines" />
					<Notices readmeFilePath="notice" />
					<PaginationExample readmeFilePath="pagination" />
					<PaymentLogo readmeFilePath="payment-logo" />
					<PieChart readmeFilePath="pie-chart" />
					<PlansSkipButton readmeFilePath="plans/plans-skip-button" />
					<PodcastIndicator readmeFilePath="podcast-indicator" />
					<Popovers readmeFilePath="popover" />
					<ProgressBar readmeFilePath="progress-bar" />
					<Ranges readmeFilePath="forms/range" />
					<Rating readmeFilePath="rating" />
					<Ribbon readmeFilePath="ribbon" />
					<ScreenReaderTextExample readmeFilePath="screen-reader-text" />
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
					<Suggestions readmeFilePath="suggestions" />
					<TextareaAutosize readmeFilePath="textarea-autosize" />
					<TextDiff readmeFilePath="text-diff" />
					<TileGrid readmeFilePath="tile-grid" />
					<TimeSince readmeFilePath="time-since" />
					<Timezone readmeFilePath="timezone" />
					<TokenFields readmeFilePath="token-field" />
					<Tooltip readmeFilePath="tooltip" />
					<VerticalMenu readmeFilePath="vertical-menu" />
					<VerticalNav readmeFilePath="vertical-nav" />
					<Version readmeFilePath="version" />
					<Wizard readmeFilePath="wizard" />
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
