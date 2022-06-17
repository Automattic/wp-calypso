import { Button, Dialog } from '@automattic/components';
import { Button as ButtonType } from '@automattic/components/dist/types/dialog/button-bar';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryPurchaseCancellationOffers from 'calypso/components/data/query-purchase-cancellation-offers';
import JetpackBenefitsStep from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-benefits-step';
import JetpackCancellationSurvey from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-cancellation-survey';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import {
	canReenableAutoRenewal,
	getName,
	isAutoRenewing,
	isPurchaseCancelable,
} from 'calypso/lib/purchases';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import nextStep from '../cancel-purchase-form/next-step';
import * as steps from './steps';
import type { Purchase } from 'calypso/lib/purchases/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	disableButtons?: boolean;
	purchase: Purchase;
	isVisible: boolean;
	onClose: () => void;
	onClickFinalConfirm: () => void;
	flowType: string;
	translate?: () => void;
	recordTracksEvent: ( name: string, data: Record< string, unknown > ) => void;
}

const CancelJetpackForm: React.FC< Props > = ( {
	isVisible = false,
	purchase,
	flowType,
	...props
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const initialCancellationStep = useMemo( () => {
		// In these cases, the subscription is getting removed.
		// Show the benefits step first.
		if (
			flowType === CANCEL_FLOW_TYPE.REMOVE ||
			flowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
		) {
			return steps.FEATURES_LOST_STEP;
		}

		return steps.CANCELLATION_REASON_STEP;
	}, [ flowType, purchase, steps ] );
	const [ cancellationStep, setCancellationStep ] = useState( initialCancellationStep ); // set initial state
	const [ surveyAnswerId, setSurveyAnswerId ] = useState< string | null >( null );
	const [ surveyAnswerText, setSurveyAnswerText ] = useState< TranslateResult | string >( '' );

	const isAtomicSite = useSelector( ( state ) =>
		isSiteAutomatedTransfer( state, purchase.siteId )
	);

	/**
	 * Set the cancellation flow back to the beginning
	 * Clear out stored state for the flow
	 */
	const resetSurveyState = () => {
		setCancellationStep( initialCancellationStep );
		setSurveyAnswerId( null );
		setSurveyAnswerText( '' );
	};

	// Record an event for Tracks
	const recordEvent = ( name: string, properties = {} ) => {
		dispatch(
			recordTracksEvent( name, {
				cancellation_flow: flowType,
				product_slug: purchase.productSlug,
				is_atomic: isAtomicSite,

				...properties,
			} )
		);
	};

	/**
	 * Get possible steps for the survey
	 */
	const availableSurveySteps = useMemo( () => {
		const availableSteps = [];

		if (
			CANCEL_FLOW_TYPE.REMOVE === flowType ||
			CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType
		) {
			availableSteps.push( steps.FEATURES_LOST_STEP );
		}

		if (
			// A purchase that is not cancellable ( can only be removed ),
			// OR a purchase that is currently set to auto-renew ( has not been cancelled yet ).
			// If a purchase that meets these criteria is being removed, present the survey step.
			( CANCEL_FLOW_TYPE.REMOVE === flowType &&
				( ( ! isPurchaseCancelable( purchase ) && ! canReenableAutoRenewal( purchase ) ) ||
					isAutoRenewing( purchase ) ) ) ||
			CANCEL_FLOW_TYPE.CANCEL_AUTORENEW === flowType ||
			CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType
		) {
			availableSteps.push( steps.CANCELLATION_REASON_STEP );
		}

		return availableSteps;
	}, [ flowType, steps, purchase ] );

	const { firstStep, lastStep } = useMemo( () => {
		return {
			firstStep: availableSurveySteps[ 0 ],
			lastStep: availableSurveySteps[ availableSurveySteps.length - 1 ],
		};
	}, [ availableSurveySteps ] );

	// run on mount
	useEffect( () => {
		resetSurveyState();
	}, [] );

	// if isVisible changes
	useEffect( () => {
		if ( isVisible && cancellationStep === firstStep ) {
			recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}, [ isVisible, firstStep ] );

	const handleCloseDialog = () => {
		props.onClose();
		resetSurveyState();

		// record tracks event
		// sends the same event name as the main product cancellation form
		recordEvent( 'calypso_purchases_cancel_form_close' );
	};

	const setSurveyStep = ( stepFunction: ( step: string, steps: string[] ) => string ) => {
		const newStep = stepFunction( cancellationStep, availableSurveySteps );

		setCancellationStep( newStep );

		// record tracks event
		// since the steps used for the Jetpack cancellation flow are different, use a different event name for Tracks
		recordEvent( 'calypso_purchases_cancel_jetpack_survey_step', { new_step: newStep } );
	};

	const clickNext = () => {
		setSurveyStep( nextStep );
	};

	const onSubmit = () => {
		if ( surveyAnswerId ) {
			const surveyData = {
				'why-cancel': {
					response: surveyAnswerId,
					text: surveyAnswerText,
				},
				type: 'cancel',
			};

			dispatch(
				submitSurvey(
					'calypso-cancel-jetpack',
					purchase.siteId,
					enrichedSurveyData( surveyData, purchase )
				)
			);
		}

		// call back to the parent component to actually cancel the subscription
		props.onClickFinalConfirm();

		// record tracks event
		// this uses the same event name as the main product cancellation form
		// this way, all cancellation stats can be viewed together
		recordEvent( 'calypso_purchases_cancel_form_submit' );
	};

	const onSurveyAnswerChange = (
		answerId: string | null,
		answerText: TranslateResult | string
	) => {
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
		const close = {
			action: 'close',
			disabled: disabled,
			isPrimary: lastStep !== cancellationStep,
			label: translate( "I'll keep it" ),
		};
		const next = {
			action: 'next',
			disabled: disabled,
			label: translate( 'Next step' ),
			onClick: clickNext,
		};
		const cancelText =
			flowType === CANCEL_FLOW_TYPE.REMOVE
				? translate( 'Remove subscription' )
				: translate( 'Cancel subscription' );
		const cancellingText =
			flowType === CANCEL_FLOW_TYPE.REMOVE ? translate( 'Removing' ) : translate( 'Cancelling' );
		const cancel = (
			<Button
				disabled={ props.disableButtons }
				busy={ props.disableButtons }
				onClick={ onSubmit }
				primary
				scary
			>
				{ props.disableButtons ? cancellingText : cancelText }
			</Button>
		);
		const firstButtons: [ ButtonType ] = [ close ];

		// on the last step
		// show the cancel button
		if ( lastStep === cancellationStep ) {
			return firstButtons.concat( [ cancel ] );
		}

		return firstButtons.concat( [ next ] );
	};

	/**
	 * renderCurrentStep
	 * Show the cancellation flow based on the current step the user is on
	 *
	 * @returns current step {string|null}
	 */
	const renderCurrentStep = () => {
		const productName = getName( purchase );

		// Step 1: what will be lost by removing the subscription
		if ( steps.FEATURES_LOST_STEP === cancellationStep ) {
			// show the user what features they will lose if they remove the Jetpack plan/ product
			// this differs a bit depending on the product/ what JP modules are active
			return (
				<JetpackBenefitsStep
					siteId={ purchase.siteId }
					purchase={ purchase }
					productSlug={ purchase.productSlug }
				/>
			);
		}

		// Step 2: Survey Question
		if ( steps.CANCELLATION_REASON_STEP === cancellationStep ) {
			// ask for brief feedback on why the user is cancelling the plan
			// follow similar pattern used in the Jetpack disconnection flow
			// make sure the user has the ability to skip the question
			return (
				<JetpackCancellationSurvey
					onAnswerChange={ onSurveyAnswerChange }
					selectedAnswerId={ surveyAnswerId }
				/>
			);
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
		<>
			<QueryPurchaseCancellationOffers
				siteId={ purchase.siteId }
				purchaseId={ purchase.id }
				ownershipId={ purchase.ownershipId }
			/>
			<Dialog
				leaveTimeout={ 0 } // this closes the modal immediately, which makes the experience feel snappier
				onClose={ handleCloseDialog }
				buttons={ renderStepButtons() } // buttons change based on current step
				isVisible={ isVisible }
				className="cancel-jetpack-form__dialog"
			>
				<div className="cancel-jetpack-form__dialog-content">{ renderCurrentStep() }</div>
			</Dialog>
		</>
	);
};

export default CancelJetpackForm;
