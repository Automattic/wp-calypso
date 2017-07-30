/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import config from 'config';
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';

/**
 * Docs examples
 */
import SearchDemo from 'components/search/docs/example';
import Notices from 'components/notice/docs/example';
import GlobalNotices from 'components/global-notices/docs/example';
import Gravatar from 'components/gravatar/docs/example';
import Buttons from 'components/button/docs/example';
import ButtonGroups from 'components/button-group/docs/example';
import Gridicons from 'gridicons/build/example';
import Accordions from 'components/accordion/docs/example';
import SocialLogos from 'social-logos/example';
import SelectDropdown from 'components/select-dropdown/docs/example';
import SegmentedControl from 'components/segmented-control/docs/example';
import Cards from 'components/card/docs/example';
import TokenFields from 'components/token-field/docs/example';
import CountedTextareas from 'components/forms/counted-textarea/docs/example';
import ProgressBar from 'components/progress-bar/docs/example';
import Popovers from 'components/popover/docs/example';
import EllipsisMenu from 'components/ellipsis-menu/docs/example';
import Ranges from 'components/forms/range/docs/example';
import Gauge from 'components/gauge/docs/example';
import Headers from 'components/header-cake/docs/example';
import DropZones from 'components/drop-zone/docs/example';
import FormFields from 'components/forms/docs/example';
import SectionNav from 'components/section-nav/docs/example';
import Spinner from 'components/spinner/docs/example';
import SpinnerButton from 'components/spinner-button/docs/example';
import SpinnerLine from 'components/spinner-line/docs/example';
import Rating from 'components/rating/docs/example';
import DatePicker from 'components/date-picker/docs/example';
import InputChrono from 'components/input-chrono/docs/example';
import ImagePreloader from 'components/image-preloader/docs/example';
import Ribbon from 'components/ribbon/docs/example';
import Timezone from 'components/timezone/docs/example';
import ClipboardButtons from 'components/forms/clipboard-button/docs/example';
import ClipboardButtonInput from 'components/clipboard-button-input/docs/example';
import InfoPopover from 'components/info-popover/docs/example';
import Tooltip from 'components/tooltip/docs/example';
import FoldableCard from 'components/foldable-card/docs/example';
import SectionHeader from 'components/section-header/docs/example';
import PaymentLogo from 'components/payment-logo/docs/example';
import Count from 'components/count/docs/example';
import Version from 'components/version/docs/example';
import BulkSelect from 'components/bulk-select/docs/example';
import ExternalLink from 'components/external-link/docs/example';
import FeatureGate from 'components/feature-example/docs/example';
import FilePickers from 'components/file-picker/docs/example';
import Collection from 'devdocs/design/search-collection';
import FAQ from 'components/faq/docs/example';
import VerticalMenu from 'components/vertical-menu/docs/example';
import Banner from 'components/banner/docs/example';
import EmojifyExample from 'components/emojify/docs/example';
import LanguagePicker from 'components/language-picker/docs/example';
import FormattedHeader from 'components/formatted-header/docs/example';
import EmptyContent from 'components/empty-content/docs/example';
import ScreenReaderTextExample from 'components/screen-reader-text/docs/example';
import PaginationExample from 'components/pagination/docs/example';

let DesignAssets = React.createClass( {
	displayName: 'DesignAssets',

	getInitialState() {
		return { filter: '' };
	},

	componentWillMount() {
		if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
			const { dispatchFetchComponentsUsageStats } = this.props;
			dispatchFetchComponentsUsageStats();
		}
	},

	onSearch( term ) {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	},

	backToComponents() {
		page( '/devdocs/design/' );
	},

	render() {
		const { componentsUsageStats = {}, component } = this.props;
		const { filter } = this.state;

		return (
			<Main className="design">
				{ component
					? <HeaderCake onClick={ this.backToComponents } backText="All Components">
							{ slugToCamelCase( component ) }
						</HeaderCake>
					: <SearchCard
							onSearch={ this.onSearch }
							initialValue={ filter }
							placeholder="Search components…"
							analyticsGroup="Docs"
						/> }

				<Collection component={ component } filter={ filter }>
					<Accordions componentUsageStats={ componentsUsageStats.accordion } readmeFilePath="components/accordion" />
					<Banner readmeFilePath="components/banner" />
					<BulkSelect readmeFilePath="components/bulk-select" />
					<ButtonGroups readmeFilePath="components/button-group" />
					<Buttons componentUsageStats={ componentsUsageStats.button } readmeFilePath="components/button" />
					<Cards readmeFilePath="components/card" />
					<ClipboardButtonInput readmeFilePath="components/clipboard-button-input" />
					<ClipboardButtons readmeFilePath="components/forms/clipboard-button" />
					<Count readmeFilePath="components/count" />
					<CountedTextareas readmeFilePath="components/forms/counted-textarea" />
					<DatePicker readmeFilePath="components/date-picker" />
					<DropZones searchKeywords="drag" readmeFilePath="components/drop-zone" />
					<EllipsisMenu readmeFilePath="components/ellipsis-menu" />
					<EmojifyExample readmeFilePath="components/emojify" />
					<EmptyContent readmeFilePath="components/empty-content" />
					<ExternalLink readmeFilePath="components/external-link" />
					<FAQ readmeFilePath="components/faq" />
					<FeatureGate readmeFilePath="components/feature-example" />
					<FilePickers readmeFilePath="components/file-picker" />
					<FoldableCard readmeFilePath="components/foldable-card" />
					<FormattedHeader readmeFilePath="components/formatted-header" />
					<FormFields searchKeywords="input textbox textarea radio" readmeFilePath="components/forms" />
					<Gauge readmeFilePath="components/gauge" />
					<GlobalNotices />
					<Gravatar readmeFilePath="components/gravatar" />
					<Gridicons />
					<Headers readmeFilePath="components/header-cake" />
					<ImagePreloader readmeFilePath="components/image-preloader" />
					<InfoPopover readmeFilePath="components/info-popover" />
					<Tooltip readmeFilePath="components/tooltip" />
					<InputChrono readmeFilePath="components/input-chrono" />
					<LanguagePicker readmeFilePath="components/language-picker" />
					<Notices />
					<PaginationExample readmeFilePath="components/pagination" />
					<PaymentLogo readmeFilePath="components/payment-logo" />
					<Popovers readmeFilePath="components/popover" />
					<ProgressBar readmeFilePath="components/progress-bar" />
					<Ranges readmeFilePath="components/forms/range" />
					<Rating readmeFilePath="components/rating" />
					<Ribbon />
					<ScreenReaderTextExample />
					<SearchDemo readmeFilePath="components/search" />
					<SectionHeader readmeFilePath="components/section-header" />
					<SectionNav readmeFilePath="components/section-nav" />
					<SegmentedControl readmeFilePath="components/segmented-control" />
					<SelectDropdown searchKeywords="menu" readmeFilePath="components/select-dropdown" />
					<SocialLogos />
					<Spinner searchKeywords="loading" readmeFilePath="components/spinner" />
					<SpinnerButton searchKeywords="loading input submit" readmeFilePath="components/spinner-button" />
					<SpinnerLine searchKeywords="loading" readmeFilePath="components/spinner-line" />
					<Timezone readmeFilePath="components/timezone" />
					<TokenFields readmeFilePath="components/token-field" />
					<VerticalMenu readmeFilePath="components/vertical-menu" />
					<Version readmeFilePath="components/version" />
				</Collection>
			</Main>
		);
	},
} );

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
