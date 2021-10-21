import { isEnabled } from '@automattic/calypso-config';
import DesignPicker, { isBlankCanvasDesign, getDesignUrl } from '@automattic/design-picker';
import { compose } from '@wordpress/compose';
import { withViewportMatch } from '@wordpress/viewport';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import WebPreview from 'calypso/components/web-preview';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getRecommendedThemes as fetchRecommendedThemes } from 'calypso/state/themes/actions';
import { getRecommendedThemes } from 'calypso/state/themes/selectors';
import PreviewToolbar from './preview-toolbar';
import './style.scss';

// Ideally this data should come from the themes API, maybe by a tag that's applied to
// themes? e.g. `link-in-bio` or `no-fold`
const STATIC_PREVIEWS = [ 'bantry', 'sigler', 'miller', 'pollard', 'paxton', 'jones', 'baker' ];

const EXCLUDED_THEMES = [
	// The Ryu theme doesn't currently have any annotations
	'ryu',
];

class DesignPickerStep extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		locale: PropTypes.string.isRequired,
		translate: PropTypes.func,
		fetchRecommendedThemes: PropTypes.func.isRequired,
		themes: PropTypes.array.isRequired,
	};

	static defaultProps = {
		useHeadstart: true,
	};

	state = {
		selectedDesign: null,
		scrollTop: 0,
	};

	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
		this.fetchThemes();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.stepSectionName !== this.props.stepSectionName ) {
			this.updateSelectedDesign();
			this.updateScrollPosition();
		}
	}

	updateScrollPosition() {
		if ( this.props.stepSectionName ) {
			this.setState( { scrollTop: document.scrollingElement.scrollTop } );
		} else {
			// Defer restore scroll position to ensure DesignPicker is rendered
			window.setTimeout( () => {
				document.scrollingElement.scrollTop = this.state.scrollTop;
			} );
		}
	}

	fetchThemes() {
		this.props.fetchRecommendedThemes( 'auto-loading-homepage' );
	}

	getDesigns() {
		// TODO fetching and filtering code should be pulled to a shared place that's usable by both
		// `/start` and `/new` onboarding flows. Or perhaps fetching should be done within the <DesignPicker>
		// component itself. The `/new` environment needs helpers for making authenticated requests to
		// the theme API before we can do this.
		return this.props.themes
			.filter( ( { id } ) => ! EXCLUDED_THEMES.includes( id ) )
			.map( ( { id, name, taxonomies } ) => ( {
				categories: taxonomies?.theme_subject ?? [
					{ name: this.props.translate( 'No Category' ), slug: 'CLIENT_ONLY-no-category' },
				],
				features: [],
				is_premium: false,
				slug: id,
				template: id,
				theme: id,
				title: name,
				...( STATIC_PREVIEWS.includes( id ) && { preview: 'static' } ),
			} ) );
	}

	updateSelectedDesign() {
		const { stepSectionName } = this.props;

		this.setState( {
			selectedDesign: this.getDesigns().find( ( { theme } ) => theme === stepSectionName ),
		} );
	}

	pickDesign = ( selectedDesign ) => {
		// Design picker preview will submit the defaultDependencies via next button,
		// So only do this when the user picks the design directly
		this.props.submitSignupStep(
			{
				stepName: this.props.stepName,
			},
			{
				selectedDesign,
			}
		);

		this.submitDesign( selectedDesign );
	};

	previewDesign = ( selectedDesign ) => {
		page( getStepUrl( this.props.flowName, this.props.stepName, selectedDesign.theme ) );
	};

	submitDesign = ( selectedDesign = this.state.selectedDesign ) => {
		recordTracksEvent( 'calypso_signup_select_design', {
			theme: `pub/${ selectedDesign?.theme }`,
			template: selectedDesign?.template,
		} );

		this.props.goToNextStep();
	};

	renderDesignPicker() {
		const designs = this.getDesigns();

		return (
			<DesignPicker
				designs={ designs }
				theme={ this.props.isReskinned ? 'light' : 'dark' }
				locale={ this.props.locale } // props.locale obtained via `localize` HoC
				onSelect={ this.pickDesign }
				onPreview={ this.previewDesign }
				highResThumbnails
				showCategoryFilter={ isEnabled( 'signup/design-picker-categories' ) }
			/>
		);
	}

	renderDesignPreview() {
		const {
			signupDependencies: { siteSlug },
			locale,
			translate,
		} = this.props;

		const { selectedDesign } = this.state;
		const previewUrl = getDesignUrl( selectedDesign, locale, { iframe: true } );

		return (
			<WebPreview
				className="design-picker__web-preview"
				showPreview
				isContentOnly
				showClose={ false }
				showEdit={ false }
				externalUrl={ siteSlug }
				previewUrl={ previewUrl }
				loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
					components: { strong: <strong /> },
				} ) }
				toolbarComponent={ PreviewToolbar }
			/>
		);
	}

	headerText() {
		const { translate } = this.props;

		return translate( 'Choose a design' );
	}
	subHeaderText() {
		const { translate } = this.props;

		return translate( 'Pick your favorite homepage layout. You can customize or change it later.' );
	}

	render() {
		const { isReskinned, isMobile, translate } = this.props;
		const { selectedDesign } = this.state;
		const headerText = this.headerText();
		const subHeaderText = this.subHeaderText();

		if ( selectedDesign ) {
			const isBlankCanvas = isBlankCanvasDesign( selectedDesign );
			const designTitle = isBlankCanvas ? translate( 'Blank Canvas' ) : selectedDesign.title;
			const defaultDependencies = { selectedDesign };

			return (
				<StepWrapper
					{ ...this.props }
					className="design-picker__preview"
					fallbackHeaderText={ designTitle }
					headerText={ designTitle }
					fallbackSubHeaderText={ '' }
					subHeaderText={ '' }
					stepContent={ this.renderDesignPreview() }
					align={ isMobile ? 'left' : 'center' }
					hideSkip
					hideNext={ false }
					nextLabelText={ translate( 'Start with %(designTitle)s', {
						args: { designTitle },
					} ) }
					defaultDependencies={ defaultDependencies }
					goToNextStep={ this.submitDesign }
				/>
			);
		}

		return (
			<StepWrapper
				{ ...this.props }
				fallbackHeaderText={ headerText }
				headerText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderDesignPicker() }
				align={ isReskinned ? 'left' : 'center' }
				skipButtonAlign={ isReskinned ? 'top' : 'bottom' }
			/>
		);
	}
}

export default compose(
	connect(
		( state ) => {
			return {
				themes: getRecommendedThemes( state, 'auto-loading-homepage' ),
			};
		},
		{ fetchRecommendedThemes, saveSignupStep, submitSignupStep }
	),
	withViewportMatch( { isMobile: '< small' } ),
	localize
)( DesignPickerStep );
