import { Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { localize, getLocaleSlug } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getStepUrl, isFirstStepInFlow } from 'calypso/signup/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSignupProgress } from 'calypso/state/signup/progress/selectors';
import { getFilteredSteps } from '../utils';
import './style.scss';

export class NavigationLink extends Component {
	static propTypes = {
		goToPreviousStep: PropTypes.func,
		goToNextStep: PropTypes.func,
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ),
		flowName: PropTypes.string.isRequired,
		labelText: PropTypes.string,
		cssClass: PropTypes.string,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		// Allows to force a back button in the first step for example.
		allowBackFirstStep: PropTypes.bool,
		rel: PropTypes.string,
		borderless: PropTypes.bool,
		primary: PropTypes.bool,
		backIcon: PropTypes.string,
		forwardIcon: PropTypes.string,
		queryParams: PropTypes.object,
		disabledTracksOnClick: PropTypes.bool,
	};

	static defaultProps = {
		labelText: '',
		allowBackFirstStep: false,
		borderless: true,
		backIcon: 'arrow-left',
		forwardIcon: 'arrow-right',
	};

	getPreviousStep( flowName, signupProgress, currentStepName ) {
		const previousStep = { stepName: null };

		if ( isFirstStepInFlow( flowName, currentStepName, this.props.userLoggedIn ) ) {
			return previousStep;
		}

		//Progressed steps will be filtered and sorted in relation to the steps definition of the current flow
		//Skipped steps are also filtered out
		const filteredProgressedSteps = getFilteredSteps(
			flowName,
			signupProgress,
			this.props.userLoggedIn
		).filter( ( step ) => ! step.wasSkipped );
		if ( filteredProgressedSteps.length === 0 ) {
			return previousStep;
		}

		//Find previous step in current relevant filtered progress
		const currentStepIndexInProgress = filteredProgressedSteps.findIndex(
			( step ) => step.stepName === currentStepName
		);

		// Current step isn't finished, so isn't part of the progress array yet, go to the top of the progress array.
		if ( currentStepIndexInProgress === -1 ) {
			return filteredProgressedSteps.pop();
		}

		return filteredProgressedSteps[ currentStepIndexInProgress - 1 ] || previousStep;
	}

	getBackUrl() {
		if ( this.props.direction !== 'back' ) {
			return;
		}

		if ( this.props.backUrl ) {
			return this.props.backUrl;
		}

		const fallbackQueryParams = window.location.search
			? Object.fromEntries( new URLSearchParams( window.location.search ).entries() )
			: undefined;

		const {
			flowName,
			signupProgress,
			stepName,
			userLoggedIn,
			queryParams = fallbackQueryParams,
		} = this.props;
		const previousStep = this.getPreviousStep( flowName, signupProgress, stepName );

		const stepSectionName = get(
			this.props.signupProgress,
			[ previousStep.stepName, 'stepSectionName' ],
			''
		);

		const locale = ! userLoggedIn ? getLocaleSlug() : '';

		return getStepUrl(
			previousStep.lastKnownFlow || this.props.flowName,
			previousStep.stepName,
			stepSectionName,
			locale,
			queryParams
		);
	}

	handleClick = () => {
		if ( this.props.direction === 'forward' ) {
			this.props.submitSignupStep(
				{ stepName: this.props.stepName },
				this.props.defaultDependencies
			);

			this.props.goToNextStep();
		} else if ( this.props.goToPreviousStep ) {
			this.props.goToPreviousStep();
		}

		if ( ! this.props.disabledTracksOnClick ) {
			this.recordClick();
		}
	};

	recordClick() {
		const tracksProps = {
			flow: this.props.flowName,
			step: this.props.stepName,
			intent: this.props.intent,
		};

		// We don't need to track if we are in the sub-steps since it's not really going back a step
		if ( this.props.direction === 'back' && ! this.props.stepSectionName ) {
			this.props.recordTracksEvent( 'calypso_signup_previous_step_button_click', tracksProps );
		}

		if ( this.props.direction === 'forward' ) {
			this.props.recordTracksEvent( 'calypso_signup_skip_step', tracksProps );
		}
	}

	render() {
		const { translate, labelText, borderless, primary, backIcon, forwardIcon } = this.props;

		if (
			this.props.positionInFlow === 0 &&
			this.props.direction === 'back' &&
			! this.props.stepSectionName &&
			! this.props.allowBackFirstStep
		) {
			return null;
		}

		let backGridicon;
		let forwardGridicon;
		let text;

		if ( this.props.direction === 'back' ) {
			backGridicon = backIcon ? <Gridicon icon={ backIcon } size={ 18 } /> : null;
			if ( labelText ) {
				text = labelText;
			} else {
				text = translate( 'Back' );
			}
		}

		if ( this.props.direction === 'forward' ) {
			forwardGridicon = forwardIcon ? <Gridicon icon={ forwardIcon } size={ 18 } /> : null;
			text = labelText ? labelText : translate( 'Skip for now' );
		}

		const buttonClasses = clsx( 'navigation-link', this.props.direction, this.props.cssClass );

		const hrefUrl =
			this.props.direction === 'forward' && this.props.forwardUrl
				? this.props.forwardUrl
				: this.getBackUrl();
		return (
			<Button
				primary={ primary }
				borderless={ borderless }
				className={ buttonClasses }
				href={ hrefUrl }
				onClick={ this.handleClick }
				rel={ this.props.rel }
			>
				{ backGridicon }
				{ text }
				{ forwardGridicon }
			</Button>
		);
	}
}

export default connect(
	( state ) => {
		const { intent } = getSignupDependencyStore( state );

		return {
			userLoggedIn: isUserLoggedIn( state ),
			signupProgress: getSignupProgress( state ),
			intent,
		};
	},
	{ recordTracksEvent, submitSignupStep }
)( localize( NavigationLink ) );
