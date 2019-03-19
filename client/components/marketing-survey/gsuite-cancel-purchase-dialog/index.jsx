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
	constructor( props ) {
		super( props );
		this.state = this.initialState;
	}

	get initialState() {
		return {
			step: steps.GSUITE_INITIAL_STEP,
			surveyAnswerId: null,
			surveyAnswerText: '',
		};
	}

	resetState = () => {
		this.setState( this.initialState );
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
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_keep_it_click' );
		closeDialog();
		this.resetState();
	};

	removeButtonClick = closeDialog => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_click' );
		this.saveSurveyResults();
		this.props.onRemovePurchase( closeDialog );
		this.resetState();
	};

	saveSurveyResults = async () => {
		const { purchase, site, surveyAnswerId, surveyAnswerText } = this.props;
		const survey = wpcom.marketing().survey( 'calypso-gsuite-remove-purchase', purchase.siteId );
		const surveyData = {
			'why-cancel': {
				response: surveyAnswerId,
				text: surveyAnswerText,
			},
			type: 'remove',
		};
		survey.addResponses( enrichedSurveyData( surveyData, moment(), site, purchase ) );

		const response = await survey.submit();
		if ( ! response.success ) {
			notices.error( response.err );
		}
	};

	onSurveyAnswerChange = ( surveyAnswerId, surveyAnswerText ) => {
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
			surveyAnswerText,
		} );
	};

	getStepButtons = () => {
		const { disabled, translate } = this.props;
		const { step, surveyAnswerId } = this.state;
		if ( steps.GSUITE_INITIAL_STEP === step ) {
			return [
				{
					action: 'cancel',
					disabled,
					isPrimary: true,
					label: translate( "I'll Keep It" ),
					onClick: this.cancelButtonClick,
				},
				{
					action: 'next',
					disabled,
					label: translate( 'Next Step' ),
					onClick: this.nextStepButtonClick,
				},
			];
		}
		return [
			{
				action: 'cancel',
				disabled,
				label: translate( "I'll Keep It" ),
				onClick: this.cancelButtonClick,
			},
			{
				action: 'prev',
				disabled,
				label: translate( 'Previous Step' ),
				onClick: this.previousStepButtonClick,
			},
			{
				action: 'remove',
				// don't allow the user to complete the survey without an selection
				disabled: disabled || null === surveyAnswerId,
				isPrimary: true,
				label: translate( 'Remove Now' ),
				onClick: this.removeButtonClick,
			},
		];
	};

	render() {
		const { disabled, isVisible, onClose, purchase } = this.props;
		const { surveyAnswerId, surveyAnswerText } = this.state;
		return (
			// By checking isVisible here we prevent rendering a "reset" dialog state before it closes
			isVisible && (
				<Dialog
					buttons={ this.getStepButtons() }
					className="gsuite-cancel-purchase-dialog__dialog"
					isVisible={ isVisible }
					onClose={ onClose }
				>
					{ steps.GSUITE_INITIAL_STEP === this.state.step ? (
						<GSuiteCancellationFeatures purchase={ purchase } />
					) : (
						<GSuiteCancellationSurvey
							disabled={ disabled }
							onSurveyAnswerChange={ this.onSurveyAnswerChange }
							surveyAnswerId={ surveyAnswerId }
							surveyAnswerText={ surveyAnswerText }
						/>
					) }
				</Dialog>
			)
		);
	}
}

GSuiteCancelPurchaseDialog.propTypes = {
	disabled: PropTypes.bool,
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
