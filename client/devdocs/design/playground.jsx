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
import Gridicon from 'gridicons';
import SocialLogo from 'social-logos';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

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
import ActionCard from 'components/action-card';
import Accordions from 'components/accordion';
import BackButton from 'components/back-button';
import Badge from 'components/badge';
import Banner from 'components/banner';
import BulkSelect from 'components/bulk-select';
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import Checklist from 'components/checklist';
import ClipboardButtonInput from 'components/clipboard-button-input';
import ClipboardButton from 'components/forms/clipboard-button';
import Collection from 'devdocs/design/search-collection';
import Count from 'components/count';
import CountedTextarea from 'components/forms/counted-textarea';
import DatePicker from 'components/date-picker';
import DropZones from 'components/drop-zone';
import EllipsisMenu from 'components/ellipsis-menu';
import Emojify from 'components/emojify';
import EmptyContent from 'components/empty-content';
import ExternalLink from 'components/external-link';
import FAQ from 'components/faq';
import FeatureGate from 'components/feature-example';
import FilePickers from 'components/file-picker';
import Focusable from 'components/focusable';
import FoldableCard from 'components/foldable-card';
import FormattedHeader from 'components/formatted-header';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormCheckbox from 'components/forms/form-checkbox';
import FormCountrySelect from 'components/forms/form-country-select';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPasswordInput from 'components/forms/form-password-input';
import FormPhoneInput from 'components/forms/form-phone-input';
import FormRadio from 'components/forms/form-radio';
import FormRadioWithThumbnail from 'components/forms/form-radio-with-thumbnail';
import FormRadiosBarExample from 'components/forms/form-radios-bar/docs/example';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormStateSelector from 'components/forms/us-state-selector';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormToggle from 'components/forms/form-toggle';
import Gauge from 'components/gauge';
import GlobalNotices from 'components/global-notices';
import Gravatar from 'components/gravatar';
import HeaderButton from 'components/header-button';
import ImagePreloader from 'components/image-preloader';
import InfoPopover from 'components/info-popover';
import InputChrono from 'components/input-chrono';
import JetpackColophon from 'components/jetpack-colophon';
import JetpackLogo from 'components/jetpack-logo';
import LanguagePicker from 'components/language-picker';
import ListEnd from 'components/list-end';
import Notices from 'components/notice';
import Pagination from 'components/pagination';
import PaymentLogo from 'components/payment-logo';
import PieChart from 'components/pie-chart';
import Popovers from 'components/popover';
import ProgressBar from 'components/progress-bar';
import Ranges from 'components/forms/range';
import Rating from 'components/rating';
import Ribbon from 'components/ribbon';
import ScreenReaderText from 'components/screen-reader-text';
import Search from 'components/search';
import SectionHeader from 'components/section-header';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavSegmented from 'components/section-nav/segmented';
import NavItem from 'components/section-nav/item';
import SegmentedControl from 'components/segmented-control';
import SelectDropdown from 'components/select-dropdown';
import ShareButton from 'components/share-button';
import SiteTitleControl from 'components/site-title';
import Spinner from 'components/spinner';
import SpinnerButton from 'components/spinner-button';
import SpinnerLine from 'components/spinner-line';
import SplitButton from 'components/split-button';
import Suggestions from 'components/suggestions';
import TextDiff from 'components/text-diff';
import TileGrid from 'components/tile-grid';
import TimeSince from 'components/time-since';
import Timezone from 'components/timezone';
import TokenFields from 'components/token-field';
import Tooltip from 'components/tooltip';
import Version from 'components/version';
import VerticalMenu from 'components/vertical-menu';
import Wizard from 'components/wizard';

class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';

	componentWillMount() {
		if ( config.isEnabled( 'devdocs/components-usage-stats' ) ) {
			const { dispatchFetchComponentsUsageStats } = this.props;
			dispatchFetchComponentsUsageStats();
		}
	}

	backToComponents = () => {
		page( '/devdocs/design/' );
	};

	render() {
		const className = classnames( 'devdocs', 'devdocs__components', {
			'is-single': true,
			'is-list': ! this.props.component,
		} );

		const scope = {
			Accordions,
			ActionCard,
			BackButton,
			Badge,
			Banner,
			BulkSelect,
			Button,
			ButtonGroup,
			Card,
			CardHeading,
			Checklist,
			ClipboardButton,
			ClipboardButtonInput,
			Collection,
			Count,
			CountedTextarea,
			DatePicker,
			DropZones,
			EllipsisMenu,
			Emojify,
			EmptyContent,
			ExternalLink,
			FAQ,
			FeatureGate,
			FilePickers,
			Focusable,
			FoldableCard,
			FormattedHeader,
			FormButton,
			FormButtonsBar,
			FormCheckbox,
			FormCountrySelect,
			FormCurrencyInput,
			FormFieldset,
			FormInputValidation,
			FormLabel,
			FormLegend,
			FormPasswordInput,
			FormPhoneInput,
			FormRadio,
			FormRadiosBarExample,
			FormRadioWithThumbnail,
			FormSectionHeading,
			FormSelect,
			FormSettingExplanation,
			FormStateSelector,
			FormTelInput,
			FormTextarea,
			FormTextInput,
			FormTextInputWithAction,
			FormTextInputWithAffixes,
			FormToggle,
			Gauge,
			GlobalNotices,
			Gravatar,
			Gridicon,
			HeaderButton,
			HeaderCake,
			ImagePreloader,
			InfoPopover,
			InputChrono,
			JetpackColophon,
			JetpackLogo,
			LanguagePicker,
			ListEnd,
			Notices,
			Main,
			Pagination,
			PaymentLogo,
			PieChart,
			Popovers,
			ProgressBar,
			Ranges,
			Rating,
			Ribbon,
			ScreenReaderText,
			SearchCard,
			Search,
			SectionHeader,
			SectionNav,
			NavTabs,
			NavSegmented,
			NavItem,
			SegmentedControl,
			SelectDropdown,
			ShareButton,
			SiteTitleControl,
			SocialLogo,
			Spinner,
			SpinnerButton,
			SpinnerLine,
			SplitButton,
			Suggestions,
			TextDiff,
			TileGrid,
			TimeSince,
			Timezone,
			TokenFields,
			Tooltip,
			Version,
			VerticalMenu,
			Wizard,
		};

		const code = `<Main>
    <HeaderCake actionText="Fun" actionIcon="status">Welcome to the Playground</HeaderCake>
	<Button primary onClick={
		function() {
			alert( 'World' );
		}
	}>
		<Gridicon icon="code" /> Hello
	</Button>
	<br /><hr /><br />
	<ActionCard
		headerText={ 'Change the code above' }
		mainText={ 'The playground lets you drop in components and play with values. It is experimental and likely will break.' }
		buttonText={ 'WordPress' }
		buttonIcon="external"
		buttonPrimary={ false }
		buttonHref="https://wordpress.com"
		buttonTarget="_blank"
	/>
	<br /><hr /><br />
	<JetpackLogo />
  <SectionNav >
    <NavTabs label="Status" selectedText="Published">
        <NavItem path="/posts" selected={ true }>Published</NavItem>
        <NavItem path="/posts/drafts" selected={ false }>Drafts</NavItem>
        <NavItem path="/posts/scheduled" selected={ false }>Scheduled</NavItem>
        <NavItem path="/posts/trashed" selected={ false }>Trashed</NavItem>
    </NavTabs>

    <NavSegmented label="Author">
        <NavItem path="/posts/my" selected={ false }>Only Me</NavItem>
        <NavItem path="/posts" selected={ true }>Everyone</NavItem>
    </NavSegmented>

    <Search
        pinned
        fitsContainer
        placeholder="Search Published..."
        delaySearch={ true }
    />
  </SectionNav>
</Main>`;

		return (
			<Main className={ className }>
				<DocumentHead title="Playground" />
				<LiveProvider
					code={ code }
					scope={ scope }
					mountStylesheet={ false }
					className="design__playground"
				>
					<div className="design__editor">
						<div className="design__error">
							<LiveError />
						</div>
						<LiveEditor />
					</div>
					<div className="design__preview">
						<LivePreview />
					</div>
				</LiveProvider>
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
