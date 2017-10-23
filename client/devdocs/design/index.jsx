/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { slugToCamelCase } from 'devdocs/docs-example/util';
import { trim } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import DocumentHead from 'components/data/document-head';
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';

/**
 * Docs examples
 */
import Accordions from 'components/accordion/docs/example';
import Banner from 'components/banner/docs/example';
import BulkSelect from 'components/bulk-select/docs/example';
import ButtonGroups from 'components/button-group/docs/example';
import Buttons from 'components/button/docs/example';
import Cards from 'components/card/docs/example';
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
import FoldableCard from 'components/foldable-card/docs/example';
import FormattedHeader from 'components/formatted-header/docs/example';
import FormFields from 'components/forms/docs/example';
import Gauge from 'components/gauge/docs/example';
import GlobalNotices from 'components/global-notices/docs/example';
import Gravatar from 'components/gravatar/docs/example';
import Gridicons from 'gridicons/build/example';
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
import SocialLogos from 'social-logos/example';
import Spinner from 'components/spinner/docs/example';
import SpinnerButton from 'components/spinner-button/docs/example';
import SpinnerLine from 'components/spinner-line/docs/example';
import Suggestions from 'components/suggestions/docs/example';
import Timezone from 'components/timezone/docs/example';
import TokenFields from 'components/token-field/docs/example';
import Tooltip from 'components/tooltip/docs/example';
import Version from 'components/version/docs/example';
import VerticalMenu from 'components/vertical-menu/docs/example';
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
					<Accordions componentUsageStats={ componentsUsageStats.accordion } />
					<Banner />
					<BulkSelect />
					<ButtonGroups />
					<Buttons componentUsageStats={ componentsUsageStats.button } />
					<Cards />
					<ClipboardButtonInput />
					<ClipboardButtons />
					<Count />
					<CountedTextareas />
					<DatePicker />
					<DropZones searchKeywords="drag" />
					<EllipsisMenu />
					<EmbedDialog />
					<EmojifyExample />
					<EmptyContent />
					<ExternalLink />
					<FAQ />
					<FeatureGate />
					<FilePickers />
					<FoldableCard />
					<FormattedHeader />
					<FormFields searchKeywords="input textbox textarea radio" />
					<Gauge />
					<GlobalNotices />
					<Gravatar />
					<Gridicons />
					<HeaderButton />
					<Headers />
					<ImagePreloader />
					<InfoPopover />
					<InputChrono />
					<JetpackColophonExample />
					<JetpackLogoExample />
					<LanguagePicker />
					<ListEnd />
					<Notices />
					<PaginationExample />
					<PaymentLogo />
					<Popovers />
					<ProgressBar />
					<Ranges />
					<Rating />
					<Ribbon />
					<ScreenReaderTextExample />
					<SearchDemo />
					<SectionHeader />
					<SectionNav />
					<SegmentedControl />
					<SelectDropdown searchKeywords="menu" />
					<SocialLogos />
					<Spinner searchKeywords="loading" />
					<SpinnerButton searchKeywords="loading input submit" />
					<SpinnerLine searchKeywords="loading" />
					<Suggestions />
					<Timezone />
					<TokenFields />
					<Tooltip />
					<Version />
					<VerticalMenu />
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
