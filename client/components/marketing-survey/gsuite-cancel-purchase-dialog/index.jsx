/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import * as steps from './steps';
import { Dialog } from '@automattic/components';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getName } from 'calypso/lib/purchases';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import GSuiteCancellationFeatures from './gsuite-cancellation-features';
import GSuiteCancellationSurvey from './gsuite-cancellation-survey';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { removePurchase } from 'calypso/state/purchases/actions';
import wpcom from 'calypso/lib/wp';

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
			isRemoving: false,
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

	cancelButtonClick = ( closeDialog ) => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_keep_it_click' );
		closeDialog();
		this.resetState();
	};

	removeButtonClick = async ( closeDialog ) => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_click' );

		this.setState( {
			isRemoving: true,
		} );
		await this.saveSurveyResults();
		const success = await this.removePurchase();
		if ( success ) {
			closeDialog();
			this.resetState();
			page( purchasesRoot );
		} else {
			this.setState( { isRemoving: false } );
		}
	};

	saveSurveyResults = async () => {
		const { purchase } = this.props;
		const { surveyAnswerId, surveyAnswerText } = this.state;
		const survey = wpcom.marketing().survey( 'calypso-gsuite-remove-purchase', purchase.siteId );
		const surveyData = {
			'why-cancel': {
				response: surveyAnswerId,
				text: surveyAnswerText,
			},
			type: 'remove',
		};
		survey.addResponses( enrichedSurveyData( surveyData, purchase ) );

		const response = await survey.submit();
		if ( ! response.success ) {
			this.props.errorNotice( response.err );
		}
	};

	removePurchase = async () => {
		const { domain, productName, purchase, translate, userId } = this.props;

		await this.props.removePurchase( purchase.id, userId );

		const { purchasesError } = this.props;

		if ( purchasesError ) {
			this.props.errorNotice( purchasesError );
			return false;
		}

		this.props.successNotice(
			translate( '%(productName)s was removed from {{domain/}}.', {
				args: {
					productName,
				},
				components: {
					domain: <em>{ domain }</em>,
				},
			} ),
			{
				isPersistent: true,
			}
		);

		return true;
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
		const { translate } = this.props;
		const { step, surveyAnswerId, isRemoving } = this.state;
		if ( steps.GSUITE_INITIAL_STEP === step ) {
			return [
				{
					action: 'cancel',
					disabled: isRemoving,
					isPrimary: true,
					label: translate( "I'll Keep It" ),
					onClick: this.cancelButtonClick,
				},
				{
					action: 'next',
					disabled: isRemoving,
					label: translate( 'Next Step' ),
					onClick: this.nextStepButtonClick,
				},
			];
		}
		return [
			{
				action: 'cancel',
				disabled: isRemoving,
				label: translate( "I'll Keep It" ),
				onClick: this.cancelButtonClick,
			},
			{
				action: 'prev',
				disabled: isRemoving,
				label: translate( 'Previous Step' ),
				onClick: this.previousStepButtonClick,
			},
			{
				action: 'remove',
				// used to get a busy button
				additionalClassNames: isRemoving ? [ 'is-busy' ] : undefined,
				// don't allow the user to complete the survey without an selection
				disabled: isRemoving || null === surveyAnswerId,
				isPrimary: true,
				label: isRemoving ? translate( 'Removing…' ) : translate( 'Remove Now' ),
				onClick: this.removeButtonClick,
			},
		];
	};

	render() {
		const { isVisible, onClose, purchase } = this.props;
		const { surveyAnswerId, surveyAnswerText, isRemoving } = this.state;

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
							disabled={ isRemoving }
							onSurveyAnswerChange={ this.onSurveyAnswerChange }
							purchase={ purchase }
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
	domain: PropTypes.string.isRequired,
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	productName: PropTypes.string.isRequired,
	purchase: PropTypes.object.isRequired,
	purchasesError: PropTypes.string,
	site: PropTypes.object.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	( state, { purchase } ) => {
		return {
			productName: getName( purchase ),
			domain: purchase.meta,
			purchasesError: getPurchasesError( state ),
			userId: getCurrentUserId( state ),
		};
	},
	{
		errorNotice,
		recordTracksEvent,
		removePurchase,
		successNotice,
	}
)( localize( GSuiteCancelPurchaseDialog ) );
