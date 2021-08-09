/**
 * External Dependencies
 */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal Dependencies
 */
import * as steps from './steps';
import { Button, Dialog } from '@automattic/components';
import { Button as ButtonType } from '@automattic/components/dist/types/dialog/button-bar';
import type { Purchase } from 'calypso/lib/purchases/types';
import { getName } from 'calypso/lib/purchases';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import nextStep from '../cancel-purchase-form/next-step';
import previousStep from '../cancel-purchase-form/previous-step';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import JetpackBenefitsStep from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-benefits-step';
import JetpackCancellationSurvey from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-cancellation-survey';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	disableButtons?: boolean;
	purchase: Purchase;
	selectedSite: { slug: string; ID: number };
	isVisible: boolean;
	onClose: () => void;
	onClickFinalConfirm: () => void;
	flowType: string;
	translate?: () => void;
	recordTracksEvent: ( name: string, data: Record< string, unknown > ) => void;
}

const CancelJetpackForm: React.FC< Props > = ( { isVisible = false, selectedSite, ...props } ) => {
	const translate = useTranslate();
	const [ cancellationStep, setCancellationStep ] = useState( steps.FEATURES_LOST_STEP ); // set initial state
	const [ surveyAnswerId, setSurveyAnswerId ] = useState< string | null >( null );
	const [ surveyAnswerText, setSurveyAnswerText ] = useState< TranslateResult | string >( '' );

	const isAtomicSite = useSelector( ( state ) => {
		return isSiteAutomatedTransfer( state, selectedSite.ID );
	} );

	/**
	 * Set the cancellation flow back to the beginning
	 * Clear out stored state for the flow
	 */
	const resetSurveyState = () => {
		setCancellationStep( steps.FEATURES_LOST_STEP );
		setSurveyAnswerId( null );
		setSurveyAnswerText( '' );
	};

	// Record an event for Tracks
	const recordEvent = ( name: string, properties = {} ) => {
		const { purchase, flowType } = props;

		recordTracksEvent( name, {
			cancellation_flow: flowType,
			product_slug: purchase.productSlug,
			is_atomic: isAtomicSite,

			...properties,
		} );
	};

	// run on mount
	useEffect( () => {
		resetSurveyState();
	}, [] );

	// if isVisible changes
	useEffect( () => {
		if ( isVisible && cancellationStep === steps.INITIAL_STEP ) {
			recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}, [ isVisible ] );

	/**
	 * Get possible steps for the survey
	 */
	const getAvailableSurveySteps = () => {
		// this could vary based on the user data/ product
		// for now, only showing two steps for all Jetpack plans and products
		return [ steps.FEATURES_LOST_STEP, steps.CANCELLATION_REASON_STEP ];
	};

	const handleCloseDialog = () => {
		props.onClose();
		resetSurveyState();

		// record tracks event
		// sends the same event name as the main product cancellation form
		recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	const setSurveyStep = ( stepFunction: ( step: string, steps: string[] ) => string ) => {
		const availableSteps = getAvailableSurveySteps();
		const newStep = stepFunction( cancellationStep, availableSteps );

		setCancellationStep( newStep );

		// record tracks event
		// since the steps used for the Jetpack cancellation flow are different, use a different event name for Tracks
		recordEvent( 'calypso_purchases_cancel_jetpack_survey_step', { new_step: newStep } );
	};

	const clickNext = () => {
		setSurveyStep( nextStep );
	};

	const clickPrevious = () => {
		setSurveyStep( previousStep );
	};

	const onSubmit = () => {
		if ( surveyAnswerId ) {
			const { purchase } = props;
			const surveyData = {
				'why-cancel': {
					response: surveyAnswerId,
					text: surveyAnswerText,
				},
				type: 'cancel',
			};

			submitSurvey(
				'calypso-cancel-jetpack',
				selectedSite.ID,
				enrichedSurveyData( surveyData, purchase )
			);
		}

		// call back to the parent component to actually cancel the subscription
		props.onClickFinalConfirm();

		// record tracks event
		// this uses the same event name as the main product cancellation form
		// this way, all cancellation stats can be viewed together
		recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	const onSurveyAnswerChange = ( answerId: string, answerText: TranslateResult | string ) => {
		if ( answerId !== surveyAnswerId ) {
			recordTracksEvent( 'calypso_purchases_cancel_jetpack_survey_answer_change', {
				answer_id: answerId,
			} );
		}

		setSurveyAnswerId( answerId );
		setSurveyAnswerText( answerText );
	};

	/**
	 * Render the dialog buttons for the current step
	 */
	const renderStepButtons = () => {
		const { disableButtons } = props;
		const disabled = disableButtons;

		// in most cases, we will have a previous and next
		const close = {
			action: 'close',
			disabled: disabled,
			label: translate( "I'll Keep It" ),
		};
		const next = {
			action: 'next',
			disabled: disabled,
			label: translate( 'Continue Cancelling' ),
			onClick: clickNext,
		};
		const prev = {
			action: 'prev',
			disabled,
			label: translate( 'Previous Step' ),
			onClick: clickPrevious,
		};

		const cancelText = translate( 'Cancel Now' );
		const cancellingText = translate( 'Cancelling' );
		const cancel = (
			<Button
				disabled={ props.disableButtons }
				busy={ props.disableButtons }
				onClick={ onSubmit }
				primary
			>
				{ props.disableButtons ? cancellingText : cancelText }
			</Button>
		);

		const firstButtons: [ ButtonType ] = [ close ];

		// on the last step
		// show the cancel button
		if ( steps.LAST_STEP === cancellationStep ) {
			const stepsCount = getAvailableSurveySteps().length;
			if ( stepsCount > 1 ) {
				firstButtons.push( prev );
			}
			return firstButtons.concat( [ cancel ] );
		}

		return firstButtons.concat(
			// on the first step, just show the "next" button
			cancellationStep === steps.INITIAL_STEP ? [ next ] : [ next, prev ]
		);
	};

	/**
	 * renderCurrentStep
	 * Show the cancellation flow based on the current step the user is on
	 *
	 * @returns current step {string|null}
	 */
	const renderCurrentStep = () => {
		const { purchase } = props;
		const productName = getName( purchase );

		// Step 1: what will be lost by cancelling
		if ( steps.FEATURES_LOST_STEP === cancellationStep ) {
			// show the user what features they will lose if they cancel the Jetpack plan/ product
			// this differs a bit depending on the product/ what JP modules are active
			return (
				<JetpackBenefitsStep
					siteId={ selectedSite.ID }
					purchase={ purchase }
					productSlug={ purchase.productSlug }
				/>
			);
		}

		// Step 2: Survey Question - where will this get sent?
		if ( steps.CANCELLATION_REASON_STEP === cancellationStep ) {
			// ask for brief feedback on why the user is cancelling the plan
			// follow similar pattern used in the Jetpack disconnection flow
			// make sure the user has the ability to skip the question
			return <JetpackCancellationSurvey onAnswerChange={ onSurveyAnswerChange } />;
		}

		// default output just in case
		// this shouldn't get rendered - but better to be prepared
		return (
			<div>
				<p>
					{ translate(
						'Are you sure you want to cancel your %(productName)s subscription? You will not be able to use it anymore!',
						{
							args: {
								productName: productName, // translators - product Name is a product like "Jetpack Search" or "Jetpack Backup (Daily)"
							},
						}
					) }
				</p>
			</div>
		);
	};

	return (
		<Dialog
			leaveTimeout={ 0 } // this closes the modal immediately, which makes the experience feel snappier
			onClose={ handleCloseDialog }
			buttons={ renderStepButtons() } // buttons change based on current step
			isVisible={ isVisible }
			className="cancel-jetpack-form__dialog"
		>
			{ renderCurrentStep() }
		</Dialog>
	);
};

export default CancelJetpackForm;
