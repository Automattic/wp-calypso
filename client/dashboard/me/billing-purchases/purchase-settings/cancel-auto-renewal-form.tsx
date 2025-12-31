import { RadioControl, __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Component } from 'react';
import { SectionHeader } from '../../../components/section-header';
import { shuffleArray } from '../../../utils/collection';
import enrichedSurveyData from '../cancel-purchase/enriched-survey-data';
import PrecancellationChatButton from './precancellation-chat-button';
import type { MarketingSurveyResponses, Purchase } from '@automattic/api-core';
// import { submitSurvey } from 'calypso/lib/purchases/actions'; //TODO: port submitSurvey to mutation

interface CancelAutoRenewFormProps {
	purchase: Purchase;
	selectedSiteId: number;
	isVisible: boolean;
	onClose: () => void;
	submitSurvey: (
		survey: string,
		selectedSiteId: number,
		surveyData: Omit< MarketingSurveyResponses, 'purchaseId' | 'purchase' >
	) => void;
}

class CancelAutoRenewalForm extends Component< CancelAutoRenewFormProps > {
	state = {
		response: '',
	};

	radioButtons = {};

	getProductTypeString = () => {
		const { purchase } = this.props;

		if ( purchase.is_domain_registration ) {
			/* translators: as in "domain name"*/
			return __( 'domain' );
		}

		if ( purchase.is_plan ) {
			/* translators: as in "Premium plan" or "Personal plan"*/
			return __( 'plan' );
		}

		return __( 'subscription' );
	};

	constructor( props: CancelAutoRenewFormProps ) {
		super( props );

		const productType = this.getProductTypeString();

		this.radioButtons = shuffleArray( [
			{
				value: 'let-it-expire',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: sprintf( __( "I'm going to let this %(productType)s expire." ), {
					productType,
				} ),
			},

			{
				value: 'manual-renew',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: sprintf( __( "I'm going to renew the %(productType)s, but will do it manually." ), {
					productType,
				} ),
			},
			{
				value: 'not-sure',
				label: __( "I'm not sure." ),
			},
		] );
	}

	onSubmit = () => {
		const { purchase, selectedSiteId } = this.props;
		const { response } = this.state;

		const surveyData = {
			response,
		};

		this.props.submitSurvey(
			'calypso-cancel-auto-renewal',
			selectedSiteId,
			enrichedSurveyData( surveyData, purchase )
		);

		this.props.onClose();
	};

	onRadioChange = ( value: string ) => {
		this.setState( {
			response: value,
		} );
	};

	render() {
		const { isVisible, onClose, purchase } = this.props;

		const productType = this.getProductTypeString();

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onCancel={ onClose }
				onConfirm={ this.onSubmit }
				cancelButtonText={ __( 'Skip' ) }
				confirmButtonText={ __( 'Submit' ) }
			>
				<SectionHeader
					title={ __( 'Help us improve' ) }
					description={
						<fieldset role="group" className="cancel-auto-renewal-form__form-fieldset">
							<p>{ __( "You've turned off auto-renewal." ) }</p>
							<p>
								{ sprintf(
									/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
									__(
										"Before you go, we'd love to know: " +
											"are you letting this %(productType)s expire completely, or do you think you'll renew it manually?"
									),
									{ productType }
								) }
							</p>
							<RadioControl
								className="cancel-auto-renewal-form__radio-control"
								hideLabelFromVision
								options={ this.radioButtons }
								selected={ this.state.response }
								onChange={ this.onRadioChange }
							/>
						</fieldset>
					}
					actions={
						<PrecancellationChatButton
							purchase={ purchase }
							onClick={ onClose }
							className="cancel-auto-renewal-form__chat-button"
						/>
					}
				/>
			</ConfirmDialog>
		);
	}
}

export default CancelAutoRenewalForm;
