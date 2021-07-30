/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import * as steps from './steps';
import { Button, Dialog } from '@automattic/components';
import nextStep from '../cancel-purchase-form/next-step';
import previousStep from '../cancel-purchase-form/previous-step';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import JetpackBenefitsStep from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-benefits-step';

/**
 * Style dependencies
 */
import './style.scss';
import { getName } from 'calypso/lib/purchases';
import PropTypes from 'prop-types';

class CancelJetpackForm extends React.Component {
	static propTypes = {
		disableButtons: PropTypes.bool,
		purchase: PropTypes.object.isRequired,
		selectedSite: PropTypes.shape( { slug: PropTypes.string.isRequired } ),
		isVisible: PropTypes.bool,
		onClose: PropTypes.func.isRequired,
		onClickFinalConfirm: PropTypes.func.isRequired,
		flowType: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		isVisible: false,
	};

	constructor( props ) {
		super( props );

		this.state = {
			cancellationStep: null, // step in the cancellation process we are on
			surveyResponse: false, // response to the survey question (why they are cancelling)
		};
	}

	componentDidMount() {
		this.resetSurveyState();
	}

	componentDidUpdate( prevProps ) {
		if (
			! prevProps.isVisible &&
			this.props.isVisible &&
			this.state.surveyStep === steps.INITIAL_STEP
		) {
			// record tracks event
			// use same event name as main product cancellation form
			this.recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}

	/**
	 * Get possible steps for the survey
	 */
	getAvailableSurveySteps() {
		// this could vary based on the user data/ product
		// for now, only showing two steps for all Jetpack plans and products
		return [ steps.FEATURES_LOST_STEP, steps.CANCELLATION_REASON_STEP ];
	}

	// Record an event for Tracks
	recordEvent = ( name, properties = {} ) => {
		const { purchase, flowType, isAtomicSite } = this.props;

		this.props.recordTracksEvent( name, {
			cancellation_flow: flowType,
			product_slug: purchase.productSlug,
			is_atomic: isAtomicSite,

			...properties,
		} );
	};

	/**
	 * Set the cancellation flow back to the beginning
	 * Clear out stored state for the flow
	 */
	resetSurveyState() {
		this.setState( {
			cancellationStep: steps.FEATURES_LOST_STEP,
			surveyResponse: false,
		} );
	}

	handleCloseDialog = () => {
		this.props.onClose();
		this.resetSurveyState();

		// record tracks event
		// sends the same event name as the main product cancellation form
		this.recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	setSurveyStep = ( stepFunction ) => {
		const availableSteps = this.getAvailableSurveySteps();
		const newStep = stepFunction( this.state.cancellationStep, availableSteps );

		this.setState( {
			cancellationStep: newStep,
		} );

		// record tracks event
		// since the steps used for the Jetpack cancellation flow are different, use a different event name for Tracks
		this.recordEvent( 'calypso_purchases_cancel_jetpack_survey_step', { new_step: newStep } );
	};

	clickNext = () => {
		this.setSurveyStep( nextStep );
	};

	clickPrevious = () => {
		this.setSurveyStep( previousStep );
	};

	onSubmit = () => {
		// TODO: handle survey submission - probably using the existing submitSurvey method

		// call back to the parent component to actually cancel the subscription
		this.props.onClickFinalConfirm();

		// record tracks event
		// this uses the same event name as the main product cancellation form
		// this way, all cancellation stats can be viewed together
		this.recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	/**
	 * Render the dialog buttons for the current step
	 */
	renderStepButtons() {
		const { disableButtons, translate } = this.props;
		const disabled = disableButtons;

		// in most cases, we will have a previous and next
		const close = {
			action: 'close',
			disabled,
			label: translate( "I'll Keep It" ),
		};
		const next = {
			action: 'next',
			disabled: disabled,
			label: translate( 'Continue Cancelling' ),
			onClick: this.clickNext,
		};
		const prev = {
			action: 'prev',
			disabled,
			label: translate( 'Previous Step' ),
			onClick: this.clickPrevious,
		};

		const cancelText = translate( 'Cancel Now' );
		const cancellingText = translate( 'Cancelling' );
		const cancel = (
			<Button
				disabled={ this.props.disableButtons }
				busy={ this.props.disableButtons }
				onClick={ this.onSubmit }
				primary
			>
				{ this.props.disableButtons ? cancellingText : cancelText }
			</Button>
		);

		const firstButtons = [ close ];

		// on the last step
		// show the cancel button
		if ( steps.LAST_STEP === this.state.cancellationStep ) {
			const stepsCount = this.getAvailableSurveySteps().length;
			if ( stepsCount > 1 ) {
				firstButtons.push( prev );
			}
			return firstButtons.concat( [ cancel ] );
		}

		return firstButtons.concat(
			// on the first step, just show the "next" button
			this.state.cancellationStep === steps.INITIAL_STEP ? [ next ] : [ next, prev ]
		);
	}

	/**
	 * renderCurrentStep
	 * Show the cancellation flow based on the current step the user is on
	 *
	 * @returns current step {string|null}
	 */
	renderCurrentStep() {
		const { selectedSite, purchase } = this.props;
		const productName = getName( purchase );

		// Step 1: what will be lost by cancelling
		if ( steps.FEATURES_LOST_STEP === this.state.cancellationStep ) {
			// show the user what features they will lose if they cancel the Jetpack plan/ product
			// this differs a bit depending on the product/ what JP modules are active
			return <JetpackBenefitsStep siteId={ selectedSite.ID } purchase={ purchase } />;
		}

		// Step 2: Survey Question - where will this get sent?
		if ( steps.CANCELLATION_REASON_STEP === this.state.cancellationStep ) {
			// ask for brief feedback on why the user is cancelling the plan
			// follow similar pattern used in the Jetpack disconnection flow
			// make sure the user has the ability to skip the question
			return 'Survey Question';
		}

		// default output just in case
		// this shouldn't get rendered - but better to be prepared
		return (
			<div>
				<p>
					Are you sure you want to cancel your { productName } subscription? You will not be able to
					use it anymore!
				</p>
			</div>
		);
	}

	render() {
		const { isVisible } = this.props;

		return (
			<Dialog
				leaveTimeout={ 0 } // this closes the modal immediately, which makes the experience feel snappier
				onClose={ this.handleCloseDialog }
				buttons={ this.renderStepButtons() } // buttons change based on current step
				isVisible={ isVisible }
				className="cancel-jetpack-form__dialog"
			>
				{ this.renderCurrentStep() }
			</Dialog>
		);
	}
}

export default connect(
	( state, { purchase } ) => ( {
		isAtomicSite: isSiteAutomatedTransfer( state, purchase.siteId ),
	} ),
	{ recordTracksEvent }
)( localize( CancelJetpackForm ) );
