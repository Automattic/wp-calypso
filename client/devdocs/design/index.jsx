/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import page from 'page';
import toTitleCase from 'to-title-case';
import trim from 'lodash/trim';

/**
 * Internal dependencies
 */
import config from 'config';
import SearchCard from 'components/search-card';
import SearchDemo from 'components/search/docs/example';
import Notices from 'components/notice/docs/example';
import GlobalNotices from 'components/global-notices/docs/example';
import Gravatar from 'components/gravatar/docs/example';
import Buttons from 'components/button/docs/example';
import ButtonGroups from 'components/button-group/docs/example';
import Gridicons from 'components/gridicon/docs/example';
import Accordions from 'components/accordion/docs/example';
import SocialLogos from 'components/social-logo/docs/example';
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
import Ribbon from 'components/ribbon/docs/example';
import Timezone from 'components/timezone/docs/example';
import ClipboardButtons from 'components/forms/clipboard-button/docs/example';
import ClipboardButtonInput from 'components/clipboard-button-input/docs/example';
import HeaderCake from 'components/header-cake';
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
import fetchComponentsUsageStats from 'state/components-usage-stats/actions';
import FAQ from 'components/faq/docs/example';
import VerticalMenu from 'components/vertical-menu/docs/example';

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
		const { componentsUsageStats = {} } = this.props;
		return (
			<div className="design-assets" role="main">
				{
					this.props.component
					? <HeaderCake onClick={ this.backToComponents } backText="All Components">
						{ toTitleCase( this.props.component ) }
					</HeaderCake>
					: <SearchCard
						onSearch={ this.onSearch }
						initialValue={ this.state.filter }
						placeholder="Search components…"
						analyticsGroup="Docs">
					</SearchCard>
				}
				<Collection component={ this.props.component } filter={ this.state.filter }>
					<Accordions componentUsageStats={ componentsUsageStats.accordion } />
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
					<ExternalLink />
					<FAQ />
					<FeatureGate />
					<FilePickers />
					<FoldableCard />
					<FormFields searchKeywords="input textbox textarea radio"/>
					<Gauge />
					<GlobalNotices />
					<Gravatar />
					<Gridicons />
					<Headers />
					<InfoPopover />
					<Tooltip />
					<InputChrono />
					<Notices />
					<PaymentLogo />
					<Popovers />
					<ProgressBar />
					<Ranges />
					<Rating />
					<Ribbon />
					<SearchDemo />
					<SectionHeader />
					<SectionNav />
					<SegmentedControl />
					<SelectDropdown searchKeywords="menu" />
					<SocialLogos />
					<Spinner searchKeywords="loading" />
					<SpinnerButton />
					<SpinnerLine searchKeywords="loading" />
					<Timezone />
					<TokenFields />
					<VerticalMenu />
					<Version />
				</Collection>
			</div>
		);
	}
} );

if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
	const mapStateToProps = ( state ) => {
		const { componentsUsageStats } = state;

		return componentsUsageStats;
	};

	const mapDispatchToProps = ( dispatch ) => {
		return bindActionCreators( {
			dispatchFetchComponentsUsageStats: fetchComponentsUsageStats
		}, dispatch );
	};

	DesignAssets.propTypes = {
		componentsUsageStats: PropTypes.object,
		isFetching: PropTypes.bool,
		dispatchFetchComponentsUsageStats: PropTypes.func
	};

	DesignAssets = connect(
		mapStateToProps,
		mapDispatchToProps
	)( DesignAssets );
}

export default DesignAssets;
