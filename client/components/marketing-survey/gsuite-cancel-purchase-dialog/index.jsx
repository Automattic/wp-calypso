/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import * as steps from './steps';
import Dialog from 'components/dialog';
import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import GSuiteCancellationFeatures from './gsuite-cancellation-features';
import GSuiteCancellationSurvey from './gsuite-cancellation-survey';
import notices from 'notices';
import { recordTracksEvent } from 'state/analytics/actions';
import wpcom from 'lib/wp';

/**
 * Style dependencies
 */
import './style.scss';

class GSuiteCancelPurchaseDialog extends Component {
	state = {
		isDisabled: false,
		step: steps.resetSteps(),
		surveyAnswerId: null,
		surveyAnswerAdditionalText: '',
	};

	nextStepButtonClick = () => {
		const { step } = this.state;
		const nextStep = steps.nextStep( step );

		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_next_step_click', {
			step,
			next_step: nextStep,
		} );
		this.setState( { step: nextStep } );
	};

	previousStepButtonClick = () => {
		const { step } = this.state;
		const prevStep = steps.previousStep( step );

		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_prev_step_click', {
			step,
			prev_step: prevStep,
		} );
		this.setState( { step: prevStep } );
	};

	cancelButtonClick = closeDialog => {
		closeDialog();
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_keep_it_click' );
		// this.setState( { step: steps.resetSteps() } );
		closeDialog();
	};

	removeButtonClick = closeDialog => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_click' );
		this.saveSurveyResults();
		this.setState( { isDisabled: true } );
		this.props.onRemovePurchase( closeDialog );
	};

	saveSurveyResults = async () => {
		const { purchase, site, surveyAnswerId, surveyAnswerAdditionalText } = this.props;
		const survey = wpcom.marketing().survey( 'calypso-gsuite-remove-purchase', purchase.siteId );
		const surveyData = {
			'why-cancel': {
				response: surveyAnswerId,
				text: surveyAnswerAdditionalText,
			},
			type: 'remove',
		};
		survey.addResponses( enrichedSurveyData( surveyData, moment(), site, purchase ) );

		const response = await survey.submit();
		if ( ! response.success ) {
			notices.error( response.err );
		}
	};

	onSurveyAnswerChange = ( surveyAnswerId, surveyAnswerAdditionalText ) => {
		if ( surveyAnswerId !== this.state.surveyAnswerId ) {
			this.props.recordTracksEvent(
				'calypso_purchases_gsuite_remove_purchase_survey_answer_change',
				{
					answer_id: surveyAnswerId,
				}
			);
		}

		this.setState( {
			surveyAnswerId,
			surveyAnswerAdditionalText,
		} );
	};

	getStepButtons = () => {
		const { translate } = this.props;
		const { isDisabled, step, surveyAnswerId } = this.state;
		if ( steps.GSUITE_INITIAL_STEP === step ) {
			return [
				{
					action: 'cancel',
					disabled: isDisabled,
					label: translate( "I'll Keep It" ),
					onClick: this.cancelButtonClick,
				},
				{
					action: 'next',
					disabled: isDisabled,
					label: translate( 'Next Step' ),
					onClick: this.nextStepButtonClick,
				},
			];
		}
		return [
			{
				action: 'cancel',
				disabled: isDisabled,
				label: translate( "I'll Keep It" ),
				onClick: this.cancelButtonClick,
			},
			{
				action: 'prev',
				disabled: isDisabled,
				label: translate( 'Previous Step' ),
				onClick: this.previousStepButtonClick,
			},
			{
				action: 'remove',
				// don't allow the user to complete the survey without an selection
				disabled: isDisabled || null === surveyAnswerId,
				// the help button is primary and this button is not when it is shown
				isPrimary: 'it-did-not-work' !== surveyAnswerId,
				label: translate( 'Remove Now' ),
				onClick: this.removeButtonClick,
			},
		];
	};

	render() {
		const { isDisabled, isVisible, onClose, purchase } = this.props;
		return (
			<Dialog
				buttons={ this.getStepButtons() }
				className="gsuite-cancel-purchase-dialog"
				isVisible={ isVisible }
				onClose={ onClose }
			>
				{ steps.GSUITE_INITIAL_STEP === this.state.step ? (
					<GSuiteCancellationFeatures purchase={ purchase } />
				) : (
					<GSuiteCancellationSurvey
						disabled={ isDisabled }
						onSurveyAnswerChange={ this.onSurveyAnswerChange }
					/>
				) }
			</Dialog>
		);
	}
}

GSuiteCancelPurchaseDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onRemovePurchase: PropTypes.func.isRequired,
	purchase: PropTypes.object.isRequired,
	site: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( GSuiteCancelPurchaseDialog ) );
