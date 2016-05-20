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
import Ranges from 'components/forms/range/docs/example';
import Gauge from 'components/gauge/docs/example';
import Headers from 'components/header-cake/docs/example';
import DropZones from 'components/drop-zone/docs/example';
import FormFields from 'components/forms/docs/example';
import SectionNav from 'components/section-nav/docs/example';
import Spinner from 'components/spinner/docs/example';
import SpinnerLine from 'components/spinner-line/docs/example';
import Rating from 'components/rating/docs/example';
import DatePicker from 'components/date-picker/docs/example';
import InputChrono from 'components/input-chrono/docs/example';
import TimezoneDropdown from 'components/timezone-dropdown/docs/example';
import ClipboardButtons from 'components/forms/clipboard-button/docs/example';
import ClipboardButtonInput from 'components/clipboard-button-input/docs/example';
import HeaderCake from 'components/header-cake';
import InfoPopover from 'components/info-popover/docs/example';
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

	getFormFiledsStats( componentsUsageStats ) {
		return Object.keys( componentsUsageStats )
			.reduce( ( target, name ) => {
				const parts = name.split( '/' );
				if ( parts[0] === 'forms' ) {
					// remove `forms/` from the name
					target[ parts.slice( 0, 1 ).join( '/' ) ] = componentsUsageStats[ name ];
				}
				return target;
			}, {} );
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
					<BulkSelect componentUsageStats={ componentsUsageStats.bulkSelect }/>
					<ButtonGroups componentUsageStats={ componentsUsageStats.buttonGroups } />
					<Buttons componentUsageStats={ componentsUsageStats.button } />
					<Cards componentUsageStats={ componentsUsageStats.cards } />
					<ClipboardButtonInput componentUsageStats={ componentsUsageStats.clipboardButtonInput } />
					<ClipboardButtons componentUsageStats={ componentsUsageStats.clipboardButton } />
					<Count componentUsageStats={ componentsUsageStats.count } />
					<CountedTextareas componentUsageStats={ componentsUsageStats.countedTextarea } />
					<DatePicker componentUsageStats={ componentsUsageStats.datePicker } />
					<DropZones searchKeywords="drag" componentUsageStats={ componentsUsageStats.dropZone } />
					<ExternalLink componentUsageStats={ componentsUsageStats.externalLink } />
					<FeatureGate componentUsageStats={ componentsUsageStats.featureGate } />
					<FilePickers componentUsageStats={ componentsUsageStats.filePicker } />
					<FoldableCard componentUsageStats={ componentsUsageStats.foldableCard } />
					<FormFields searchKeywords="input textbox textarea radio" componentsUsageStats={ this.getFormFiledsStats( componentsUsageStats ) } />
					<Gauge componentUsageStats={ componentsUsageStats.gauge } />
					<GlobalNotices componentUsageStats={ componentsUsageStats.globalNotices } />
					<Gridicons componentUsageStats={ componentsUsageStats.gridicon } />
					<Headers />
					<InfoPopover componentUsageStats={ componentsUsageStats.infoPopover } />
					<InputChrono componentUsageStats={ componentsUsageStats.inputChrono } />
					<Notices componentUsageStats={ componentsUsageStats.notices } />
					<PaymentLogo componentUsageStats={ componentsUsageStats.paymentLogo } />
					<Popovers componentUsageStats={ componentsUsageStats.popover } />
					<ProgressBar componentUsageStats={ componentsUsageStats.progressBar } />
					<Ranges componentUsageStats={ componentsUsageStats.range } />
					<Rating componentUsageStats={ componentsUsageStats.rating } />
					<SearchDemo componentUsageStats={ componentsUsageStats.search } />
					<SectionHeader componentUsageStats={ componentsUsageStats.sectionHeader } />
					<SectionNav componentUsageStats={ componentsUsageStats.sectionNav } />
					<SegmentedControl componentUsageStats={ componentsUsageStats.segmentedControl } />
					<SelectDropdown searchKeywords="menu" />
					<SocialLogos componentUsageStats={ componentsUsageStats.socialLogo } />
					<Spinner searchKeywords="loading" componentUsageStats={ componentsUsageStats.spinner } />
					<SpinnerLine searchKeywords="loading" componentUsageStats={ componentsUsageStats.spinnerLine } />
					<TimezoneDropdown componentUsageStats={ componentsUsageStats.timezoneDropdown } />
					<TokenFields componentUsageStats={ componentsUsageStats.tokenField } />
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
