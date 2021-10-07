import { isEnabled } from '@automattic/calypso-config';
import DesignPicker from '@automattic/design-picker';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getRecommendedThemes as fetchRecommendedThemes } from 'calypso/state/themes/actions';
import { getRecommendedThemes } from 'calypso/state/themes/selectors';
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

	componentDidMount() {
		this.fetchThemes();
	}

	fetchThemes() {
		this.props.fetchRecommendedThemes( 'auto-loading-homepage' );
	}

	pickDesign = ( selectedDesign ) => {
		recordTracksEvent( 'calypso_signup_select_design', {
			theme: `pub/${ selectedDesign?.theme }`,
			template: selectedDesign?.template,
		} );

		this.props.submitSignupStep(
			{
				stepName: this.props.stepName,
			},
			{
				selectedDesign,
			}
		);

		this.props.goToNextStep();
	};

	renderDesignPicker() {
		// TODO fetching and filtering code should be pulled to a shared place that's usable by both
		// `/start` and `/new` onboarding flows. Or perhaps fetching should be done within the <DesignPicker>
		// component itself. The `/new` environment needs helpers for making authenticated requests to
		// the theme API before we can do this.
		const designs = this.props.themes
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

		return (
			<DesignPicker
				designs={ designs }
				theme={ this.props.isReskinned ? 'light' : 'dark' }
				locale={ this.props.locale } // props.locale obtained via `localize` HoC
				onSelect={ this.pickDesign }
				highResThumbnails
				showCategoryFilter={ isEnabled( 'signup/design-picker-categories' ) }
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
		const { isReskinned } = this.props;
		const headerText = this.headerText();
		const subHeaderText = this.subHeaderText();

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				headerText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderDesignPicker() }
				align={ isReskinned ? 'left' : 'center' }
				skipButtonAlign={ isReskinned ? 'top' : 'bottom' }
				{ ...this.props }
			/>
		);
	}
}

export default connect(
	( state ) => {
		return {
			themes: getRecommendedThemes( state, 'auto-loading-homepage' ),
		};
	},
	{ fetchRecommendedThemes, submitSignupStep }
)( localize( DesignPickerStep ) );
