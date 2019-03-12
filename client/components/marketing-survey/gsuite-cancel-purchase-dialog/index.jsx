/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import * as steps from './steps';
import Dialog from 'components/dialog';
import GSuiteCancellationFeatures from './gsuite-cancellation-features';
import GSuiteCancellationSurvey from './gsuite-cancellation-survey';

class GSuiteCancelPurchaseDialog extends Component {
	state = {
		step: steps.resetSteps(),
		isDisabled: false,
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

	removeButtonClick = () => {
		this.saveSurveyResults();
		this.removePurchase();
	};

	removePurchase = () => {
		// TODO: copy & simplify from <RemovePurchase />
	};

	saveSurveyResults = () => {
		// TODO: copy & simplify from <RemovePurchase />
	};

	onSurveryAnswerChange = () => {};

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
	purchase: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( GSuiteCancelPurchaseDialog );
