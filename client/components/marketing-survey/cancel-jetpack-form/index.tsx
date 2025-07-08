import config from '@automattic/calypso-config';
import { Button, Dialog } from '@automattic/components';
import { BaseButton } from '@automattic/components/dist/types/dialog/button-bar';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as React from 'react';
import QueryPurchaseCancellationOffers from 'calypso/components/data/query-purchase-cancellation-offers';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackBenefitsStep from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-benefits-step';
import JetpackCancellationSurvey from 'calypso/components/marketing-survey/cancel-jetpack-form/jetpack-cancellation-survey';
import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import Notice from 'calypso/components/notice';
import { getName, isExpired } from 'calypso/lib/purchases';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import { isJetpackTemporarySitePurchase } from 'calypso/me/purchases/utils';
import { useSelector, useDispatch } from 'calypso/state';
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
	purchaseListUrl: string; // The URL of the purchase page to redirect to.
	isVisible: boolean;
	onClose: () => void;
	onSurveyComplete: () => void;
	flowType: string;
	translate?: () => void;
	isAkismet?: boolean;
	cancellationInProgress?: boolean;
	cancellationCompleted?: boolean;
	cancellationMessage?: string;
}

const CancelJetpackForm: React.FC< Props > = ( {
	isVisible = false,
	purchase,
	flowType,
	...props
} ) => {
	const shouldProvideCancellationOffer = config.isEnabled( 'cancellation-offers' );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const initialCancellationStep = useMemo( () => {
		// If the subscription is expired, the only step in the survey is the removal confirmation
		if ( isExpired( purchase ) || isJetpackTemporarySitePurchase( purchase ) ) {
			return steps.CANCEL_CONFIRM_STEP;
		}

		// If cancellation is already completed, skip benefits step and go directly to survey
		if ( props.cancellationCompleted ) {
			return steps.CANCELLATION_REASON_STEP;
		}

		// In these cases, the subscription is getting removed.
		// Show the benefits step first.
		if (
			flowType === CANCEL_FLOW_TYPE.REMOVE ||
			flowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
		) {
			return steps.FEATURES_LOST_STEP;
		}

		return steps.CANCELLATION_REASON_STEP;
	}, [ flowType, purchase, props.cancellationCompleted ] );
	const [ cancellationStep, setCancellationStep ] = useState( initialCancellationStep ); // set initial state
	const [ surveyAnswerId, setSurveyAnswerId ] = useState< string | null >( null );
	const [ surveyAnswerText, setSurveyAnswerText ] = useState< TranslateResult | string >( '' );
	const [ disableContinuation, setDisableContinuation ] = useState< boolean >( false );

	const isAtomicSite = useSelector( ( state ) =>
		isSiteAutomatedTransfer( state, purchase.siteId )
	);

	/**
	 * Set the cancellation flow back to the beginning
	 * Clear out stored state for the flow
	 */
	const resetSurveyState = useCallback( () => {
		setCancellationStep( initialCancellationStep );
		setSurveyAnswerId( null );
		setSurveyAnswerText( '' );
	}, [ initialCancellationStep ] );

	// Record an event for Tracks
	const recordEvent = useCallback(
		( name: string, properties = {} ) => {
			dispatch(
				recordTracksEvent( name, {
					cancellation_flow: flowType,
					product_slug: purchase.productSlug,
					is_atomic: isAtomicSite,

					...properties,
				} )
			);
		},
		[ dispatch, flowType, isAtomicSite, purchase.productSlug ]
	);

	/**
	 * Get possible steps for the survey
	 */
	const availableSurveySteps = useMemo( () => {
		const availableSteps = [];

		// If the plan is already expired or is a temporary Jetpack purchase (license),
		// we only need one "confirm" step for the survey is the removal confirmation
		// A product that is not in use does not need to collect the survey or show benefits
		if ( isExpired( purchase ) || isJetpackTemporarySitePurchase( purchase ) ) {
			return [ steps.CANCEL_CONFIRM_STEP ];
		}

		// Don't show benefits step if cancellation is already completed
		if (
			! props.cancellationCompleted &&
			( CANCEL_FLOW_TYPE.REMOVE === flowType || CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType )
		) {
			availableSteps.push( steps.FEATURES_LOST_STEP );
		}

		// Always include the survey step if cancellation is completed, or if it's a normal cancellation flow
		if (
			props.cancellationCompleted ||
			CANCEL_FLOW_TYPE.CANCEL_AUTORENEW === flowType ||
			CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND === flowType
		) {
			availableSteps.push( steps.CANCELLATION_REASON_STEP );
		}
		return availableSteps;
	}, [ flowType, purchase, props.cancellationCompleted ] );

	const { firstStep, lastStep } = useMemo( () => {
		return {
			firstStep: availableSurveySteps[ 0 ],
			lastStep: availableSurveySteps[ availableSurveySteps.length - 1 ],
		};
	}, [ availableSurveySteps ] );

	// run on mount
	useEffect( () => {
		resetSurveyState();
	}, [ resetSurveyState ] );

	// if isVisible changes
	useEffect( () => {
		if ( isVisible && cancellationStep === firstStep ) {
			recordEvent( 'calypso_purchases_cancel_form_start' );
		}
	}, [ isVisible, firstStep, cancellationStep, recordEvent ] );

	const handleCloseDialog = () => {
		props.onClose();
		// record tracks event
		// sends the same event name as the main product cancellation form
		recordEvent( 'calypso_purchases_cancel_form_close' );
		resetSurveyState();
	};

	const setSurveyStep = useCallback(
		( stepFunction: ( step: string, steps: string[] ) => string ) => {
			const newStep = stepFunction( cancellationStep, availableSurveySteps );

			setCancellationStep( newStep );

			// record tracks event
			// since the steps used for the Jetpack cancellation flow are different, use a different event name for Tracks
			recordEvent( 'calypso_purchases_cancel_jetpack_survey_step', { new_step: newStep } );
		},
		[ availableSurveySteps, cancellationStep, recordEvent ]
	);

	// Disable continuation button if "Other" is selected but no reason is written in
	useEffect( () => {
		if ( surveyAnswerId === 'another-reason' && ( surveyAnswerText as string ).trim() === '' ) {
			setDisableContinuation( true );
		} else {
			setDisableContinuation( false );
		}
	}, [ surveyAnswerId, surveyAnswerText ] );

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
					props.isAkismet ? 'calypso-cancel-akismet' : 'calypso-cancel-jetpack',
					purchase.siteId,
					enrichedSurveyData( surveyData, purchase )
				)
			);
		}

		if ( props.onSurveyComplete ) {
			props.onSurveyComplete();
		}

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
		const { disableButtons, cancellationCompleted, cancellationInProgress } = props;
		const disabled = disableButtons;

		// Determine button text based on cancellation state and flow type
		const getButtonText = () => {
			if ( cancellationCompleted ) {
				return translate( 'Submit' );
			}
			if ( flowType === CANCEL_FLOW_TYPE.REMOVE ) {
				return translate( 'Remove subscription' );
			}
			return translate( 'Cancel subscription' );
		};

		const close = {
			action: 'close',
			disabled: disabled,
			isPrimary: cancellationCompleted ? false : lastStep !== cancellationStep,
			label: translate( 'Close' ),
		};
		const next = {
			action: 'next',
			disabled: disabled || disableContinuation,
			isPrimary: cancellationCompleted,
			label: translate( 'Next step' ),
			onClick: clickNext,
		};

		const cancel = (
			<Button
				disabled={ disabled || disableContinuation }
				busy={ cancellationInProgress }
				onClick={ onSubmit }
				primary
				scary={ ! cancellationCompleted }
			>
				{ getButtonText() }
			</Button>
		);

		const firstButtons: ( BaseButton | React.ReactElement )[] = [ close ];

		// Cancel confirm step only shows the remove button
		if ( steps.CANCEL_CONFIRM_STEP === cancellationStep ) {
			return firstButtons.concat( [ cancel ] );
		}

		// on the last step
		// show the cancel button here
		if ( lastStep === cancellationStep ) {
			return firstButtons.concat( [ cancel ] );
		}

		return firstButtons.concat( [ next ] );
	};

	/**
	 * renderCurrentStep
	 * Show the cancellation flow based on the current step the user is on
	 * @returns current step {string|null}
	 */
	const renderCurrentStep = () => {
		const productName = getName( purchase );
		const { cancellationMessage } = props;

		if ( steps.CANCEL_CONFIRM_STEP === cancellationStep ) {
			return (
				<div className="cancel-jetpack-form__confirm-step">
					<FormattedHeader
						brandFont
						headerText={ translate( 'Confirm removal' ) }
						subHeaderText={
							/* Translators: productName is the name of a Jetpack product. */
							translate(
								'We’re sorry to see you go. Click "Remove subscription" to confirm and remove %(productName)s from your account.',
								{
									args: {
										productName,
									},
								}
							)
						}
					/>
				</div>
			);
		}

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
				<>
					{ cancellationMessage && (
						<div className="cancel-jetpack-form__notice-container">
							<Notice
								status="is-success"
								className="cancel-jetpack-form__notice"
								theme="light"
								showDismiss={ false }
							>
								{ cancellationMessage }
							</Notice>
						</div>
					) }

					<JetpackCancellationSurvey
						onAnswerChange={ onSurveyAnswerChange }
						selectedAnswerId={ surveyAnswerId }
						isAkismet={ !! props?.isAkismet }
					/>
				</>
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
			{ shouldProvideCancellationOffer && purchase.siteId && purchase.id && (
				<QueryPurchaseCancellationOffers siteId={ purchase.siteId } purchaseId={ purchase.id } />
			) }
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
