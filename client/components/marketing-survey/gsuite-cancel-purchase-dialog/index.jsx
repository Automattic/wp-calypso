/** @format */

/**
 * External dependencies
 */
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
import wpcom from 'lib/wp';

class GSuiteCancelPurchaseDialog extends Component {
	state = {
		isDisabled: false,
		step: steps.resetSteps(),
		surveyAnswerId: null,
		surveyAnswerAdditionalText: '',
	};

	nextStepButtonClick = () => {
		this.setState( ( { step } ) => {
			return { step: steps.nextStep( step ) };
		} );
	};

	previousStepButtonClick = () => {
		this.setState( ( { step } ) => {
			return { step: steps.previousStep( step ) };
		} );
	};

	removeButtonClick = action => {
		this.saveSurveyResults();
		this.props.onRemovePurchase( action );
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

	onSurveryAnswerChange = ( surveyAnswerId, surveyAnswerAdditionalText ) => {
		this.setState( {
			surveyAnswerId,
			surveyAnswerAdditionalText,
		} );
	};

	getStepButtons = () => {
		const { translate } = this.props;
		const { step, isDisabled } = this.state;
		if ( steps.GSUITE_INITIAL_STEP === step ) {
			return [
				{
					action: 'cancel',
					disabled: isDisabled,
					label: translate( "I'll Keep It" ),
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
			},
			{
				action: 'prev',
				disabled: isDisabled,
				label: translate( 'Previous Step' ),
				onClick: this.previousStepButtonClick,
			},
			{
				action: 'remove',
				disabled: isDisabled,
				isPrimary: true,
				label: translate( 'Remove Now' ),
				onClick: this.removeButtonClick,
			},
		];
	};

	render() {
		const { isVisible, onClose, purchase } = this.props;
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
					<GSuiteCancellationSurvey onSurveryAnswerChange={ this.onSurveryAnswerChange } />
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

export default localize( GSuiteCancelPurchaseDialog );
