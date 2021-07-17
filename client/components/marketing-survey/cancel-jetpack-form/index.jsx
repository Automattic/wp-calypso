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
import { Dialog } from '@automattic/components';
import nextStep from '../cancel-purchase-form/next-step';
import previousStep from '../cancel-purchase-form/previous-step';

class CancelJetpackForm extends React.Component {
	// prop types

	// default props

	constructor( props ) {
		super( props );

		this.state = {
			cancellationStep: steps.FEATURES_LOST_STEP, // step in the cancellation process we are on
			surveyResponse: false, // response to the survey question (why they are cancelling)
		};
	}

	/**
	 * Get possible steps for the survey
	 */
	getAvailableSurveySteps() {
		// this will vary based on the user data/ product
		return [
			steps.FEATURES_LOST_STEP,
			steps.CANCELLATION_REASON_STEP,
			steps.PRODUCT_CANCELLED_STEP,
		];
	}

	/**
	 * Set the cancellation flow back to the beginning
	 * Clear out stored state for the flow
	 */
	resetSurveyState() {
		this.setState( {
			cancellationStep: steps.FEATURES_LOST_STEP,
		} );
	}

	handleCloseDialog = () => {
		this.props.onClose();
		this.resetSurveyState();
	};

	setSurveyStep = ( stepFunction ) => {
		const availableSteps = this.getAvailableSurveySteps();
		const newStep = stepFunction( this.state.cancellationStep, availableSteps );

		this.setState( {
			cancellationStep: newStep,
		} );
	};

	clickNext = () => {
		this.setSurveyStep( nextStep );
	};

	clickPrevious = () => {
		this.setSurveyStep( previousStep );
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
			label: translate( 'Next Step' ),
			onClick: this.clickNext,
		};
		const prev = {
			action: 'prev',
			disabled,
			label: translate( 'Previous Step' ),
			onClick: this.clickPrevious,
		};
		return [ close, prev, next ];
	}

	/**
	 * renderCurrentStep
	 * Show the cancellation flow based on the current step the user is on
	 *
	 * @returns current step {string|null}
	 */
	renderCurrentStep() {
		// show steps for JP disconnection survey and offer

		// Step 1: what will be lost by cancelling
		if ( steps.FEATURES_LOST_STEP === this.state.cancellationStep ) {
			// show the user what features they will lose if they cancel the Jetpack plan/ product
			// this differs a bit depending on the product/ what JP modules are active

			// information needs to be collected about the Jetpack site to show current "benefits"
			// load once into current state when this module is activated? - the same data would be shown for a disconnection
			return 'Features Lost';
		}

		// Step 2: Survey Question - where will this get sent?
		if ( steps.CANCELLATION_REASON_STEP === this.state.cancellationStep ) {
			// ask for brief feedback on why the user is cancelling the plan
			return 'Survey Question';
		}

		// Step 3: Special Offer ( Conditional - only show to a user once - check that they have not already used discount )
		if ( steps.CANCELLATION_OFFER_STEP === this.state.cancellationStep ) {
			return 'Cancellation Offer';
		}

		// Step 4: Discount Confirmation ( Conditional - only if discount is accepted )
		if ( steps.OFFER_APPLIED_STEP === this.state.cancellationStep ) {
			return 'Discount Applied';
		}

		// Step 5: Cancellation Confirmation ( Conditional - only if plan is actually cancelled )
		if ( steps.PRODUCT_CANCELLED_STEP === this.state.cancellationStep ) {
			return 'Product Cancelled';
		}

		return null;
	}

	render() {
		const { isVisible } = this.props;

		return (
			<Dialog
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
	() => ( {
		// has user seen coupon already?
		hasUsedJetpackCancellationOffer: false,
	} ),
	{}
)( localize( CancelJetpackForm ) );
