/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { slugToCamelCase } from 'client/devdocs/docs-example/util';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import DocumentHead from 'client/components/data/document-head';
import fetchComponentsUsageStats from 'client/state/components-usage-stats/actions';
import HeaderCake from 'client/components/header-cake';
import Main from 'client/components/main';
import SearchCard from 'client/components/search-card';

/**
 * Docs examples
 */
import Accordions from 'client/components/accordion/docs/example';
import Banner from 'client/components/banner/docs/example';
import BulkSelect from 'client/components/bulk-select/docs/example';
import ButtonGroups from 'client/components/button-group/docs/example';
import Buttons from 'client/components/button/docs/example';
import Cards from 'client/components/card/docs/example';
import Checklist from 'client/components/checklist/docs/example';
import ClipboardButtonInput from 'client/components/clipboard-button-input/docs/example';
import ClipboardButtons from 'client/components/forms/clipboard-button/docs/example';
import Collection from 'client/devdocs/design/search-collection';
import Count from 'client/components/count/docs/example';
import CountedTextareas from 'client/components/forms/counted-textarea/docs/example';
import DatePicker from 'client/components/date-picker/docs/example';
import DropZones from 'client/components/drop-zone/docs/example';
import EllipsisMenu from 'client/components/ellipsis-menu/docs/example';
import EmbedDialog from 'client/components/tinymce/plugins/embed/docs/example';
import EmojifyExample from 'client/components/emojify/docs/example';
import EmptyContent from 'client/components/empty-content/docs/example';
import ExternalLink from 'client/components/external-link/docs/example';
import FAQ from 'client/components/faq/docs/example';
import FeatureGate from 'client/components/feature-example/docs/example';
import FilePickers from 'client/components/file-picker/docs/example';
import FoldableCard from 'client/components/foldable-card/docs/example';
import FormattedHeader from 'client/components/formatted-header/docs/example';
import FormFields from 'client/components/forms/docs/example';
import Gauge from 'client/components/gauge/docs/example';
import GlobalNotices from 'client/components/global-notices/docs/example';
import Gravatar from 'client/components/gravatar/docs/example';
import Gridicons from 'gridicons/build/example';
import HeaderButton from 'client/components/header-button/docs/example';
import Headers from 'client/components/header-cake/docs/example';
import ImagePreloader from 'client/components/image-preloader/docs/example';
import InfoPopover from 'client/components/info-popover/docs/example';
import InputChrono from 'client/components/input-chrono/docs/example';
import JetpackColophonExample from 'client/components/jetpack-colophon/docs/example';
import JetpackLogoExample from 'client/components/jetpack-logo/docs/example';
import LanguagePicker from 'client/components/language-picker/docs/example';
import ListEnd from 'client/components/list-end/docs/example';
import Notices from 'client/components/notice/docs/example';
import PaginationExample from 'client/components/pagination/docs/example';
import PaymentLogo from 'client/components/payment-logo/docs/example';
import Popovers from 'client/components/popover/docs/example';
import ProgressBar from 'client/components/progress-bar/docs/example';
import Ranges from 'client/components/forms/range/docs/example';
import Rating from 'client/components/rating/docs/example';
import Ribbon from 'client/components/ribbon/docs/example';
import ScreenReaderTextExample from 'client/components/screen-reader-text/docs/example';
import SearchDemo from 'client/components/search/docs/example';
import SectionHeader from 'client/components/section-header/docs/example';
import SectionNav from 'client/components/section-nav/docs/example';
import SegmentedControl from 'client/components/segmented-control/docs/example';
import SelectDropdown from 'client/components/select-dropdown/docs/example';
import ShareButton from 'client/components/share-button/docs/example';
import SocialLogos from 'social-logos/example';
import Spinner from 'client/components/spinner/docs/example';
import SpinnerButton from 'client/components/spinner-button/docs/example';
import SpinnerLine from 'client/components/spinner-line/docs/example';
import SplitButton from 'client/components/split-button/docs/example';
import Suggestions from 'client/components/suggestions/docs/example';
import TextDiff from 'client/components/text-diff/docs/example';
import TileGrid from 'client/components/tile-grid/docs/example';
import TimeSince from 'client/components/time-since/docs/example';
import Timezone from 'client/components/timezone/docs/example';
import TokenFields from 'client/components/token-field/docs/example';
import Tooltip from 'client/components/tooltip/docs/example';
import Version from 'client/components/version/docs/example';
import VerticalMenu from 'client/components/vertical-menu/docs/example';
import Wizard from 'client/components/wizard/docs/example';

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

		return (
			<Main className="design">
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
					/>
				) }

				<Collection component={ component } filter={ filter }>
					<Accordions
						componentUsageStats={ componentsUsageStats.accordion }
						readmeFilePath="accordion"
					/>
					<Banner readmeFilePath="banner" />
					<BulkSelect readmeFilePath="bulk-select" />
					<ButtonGroups readmeFilePath="button-group" />
					<Buttons componentUsageStats={ componentsUsageStats.button } readmeFilePath="button" />
					<SplitButton readmeFilePath="split-button" />
					<Cards readmeFilePath="card" />
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
