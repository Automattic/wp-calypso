import page from '@automattic/calypso-router';
import { Dialog } from '@automattic/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import { enrichedSurveyData, getName } from 'calypso/me/purchases/lib/raw-purchase-helpers';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { removePurchase } from 'calypso/state/purchases/actions';
import { getPurchasesError } from 'calypso/state/purchases/selectors';
import GSuiteCancellationFeatures from './gsuite-cancellation-features';
import GSuiteCancellationSurvey from './gsuite-cancellation-survey';
import * as steps from './steps';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

import './style.scss';

interface GSuiteCancelPurchaseDialogOwnProps {
	isVisible: boolean;
	onClose: () => void;
	purchase: Purchase;
	site?: SiteDetails | null;
}

function mapStateToProps( state: AppState, { purchase }: GSuiteCancelPurchaseDialogOwnProps ) {
	return {
		domain: purchase.meta,
		productName: getName( purchase ),
		purchasesError: ( getPurchasesError( state ) || null ) as string | null,
		userId: getCurrentUserId( state ),
	};
}

function mapDispatchToProps( dispatch: CalypsoDispatch ) {
	return bindActionCreators(
		{
			errorNotice,
			recordTracksEvent,
			removePurchase,
			successNotice,
			submitSurvey,
		},
		dispatch
	);
}

type GSuiteCancelPurchaseDialogProps = GSuiteCancelPurchaseDialogOwnProps &
	ReturnType< typeof mapStateToProps > &
	ReturnType< typeof mapDispatchToProps > &
	LocalizeProps;

interface GSuiteCancelPurchaseDialogState {
	step: string;
	surveyAnswerId: string | null;
	surveyAnswerText: string;
	isRemoving: boolean;
}

class GSuiteCancelPurchaseDialog extends Component<
	GSuiteCancelPurchaseDialogProps,
	GSuiteCancelPurchaseDialogState
> {
	static defaultProps = {};

	constructor( props: GSuiteCancelPurchaseDialogProps ) {
		super( props );
		this.state = this.initialState;
	}

	get initialState(): GSuiteCancelPurchaseDialogState {
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
		const nextStep = steps.nextStep();

		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_next_step_click', {
			step,
			next_step: nextStep,
		} );
		this.setState( { step: nextStep } );
	};

	previousStepButtonClick = () => {
		const { step } = this.state;
		const prevStep = steps.previousStep();

		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_prev_step_click', {
			step,
			prev_step: prevStep,
		} );
		this.setState( { step: prevStep } );
	};

	cancelButtonClick = ( closeDialog: () => void ) => {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_keep_it_click' );
		closeDialog();
		this.resetState();
	};

	removeButtonClick = async ( closeDialog: () => void ) => {
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

	saveSurveyResults = () => {
		const { purchase } = this.props;
		const { surveyAnswerId, surveyAnswerText } = this.state;
		const surveyData = {
			'why-cancel': {
				response: surveyAnswerId ?? undefined,
				text: surveyAnswerText,
			},
			type: 'remove',
		};

		this.props.submitSurvey(
			'calypso-gsuite-remove-purchase',
			purchase.blog_id,
			enrichedSurveyData( surveyData, purchase )
		);
	};

	removePurchase = async () => {
		const { domain, productName, purchase, translate, userId } = this.props;

		await this.props.removePurchase( purchase.ID, userId );

		const { purchasesError } = this.props;

		if ( purchasesError ) {
			this.props.errorNotice( purchasesError );
			return false;
		}

		const successMessage = translate( '%(productName)s was removed from {{domain/}}.', {
			args: { productName },
			components: { domain: <em>{ domain }</em> },
		} );
		this.props.successNotice( successMessage, { isPersistent: true } );

		return true;
	};

	onSurveyAnswerChange = ( surveyAnswerId: string | null, surveyAnswerText: string ) => {
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
				additionalClassNames: isRemoving ? 'is-busy' : undefined,
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

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( GSuiteCancelPurchaseDialog ) );
