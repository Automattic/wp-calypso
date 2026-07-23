import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import { shuffle } from '@automattic/js-utils';
import { Button, RadioControl } from '@wordpress/components';
import { localize, type LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import PrecancellationChatButton from 'calypso/components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import type { Purchases } from '@automattic/data-stores';

import './style.scss';

interface CancelAutoRenewalFormProps {
	purchase: Purchases.Purchase;
	selectedSiteId: number;
	isVisible?: boolean;
	onClose: () => void;
}

interface CancelAutoRenewalFormConnectedProps {
	submitSurvey: (
		surveyName: string,
		siteId: number,
		surveyData: Record< string, unknown >
	) => void;
}

interface CancelAutoRenewalFormState {
	response: string;
}

type CancelAutoRenewalFormAllProps = CancelAutoRenewalFormProps &
	CancelAutoRenewalFormConnectedProps &
	LocalizeProps;

class CancelAutoRenewalForm extends Component<
	CancelAutoRenewalFormAllProps,
	CancelAutoRenewalFormState
> {
	state: CancelAutoRenewalFormState = {
		response: '',
	};

	radioButtons: Array< { value: string; label: string } > = [];

	getProductTypeString = () => {
		const { purchase, translate } = this.props;

		if ( isDomainRegistration( purchase ) ) {
			/* translators: as in "domain name"*/
			return translate( 'domain' );
		}

		if ( isPlan( purchase ) ) {
			/* translators: as in "Premium plan" or "Personal plan"*/
			return translate( 'plan' );
		}

		return translate( 'subscription' );
	};

	constructor( props: CancelAutoRenewalFormAllProps ) {
		super( props );

		const { translate } = props;
		const productType = this.getProductTypeString();

		this.radioButtons = shuffle( [
			{
				value: 'let-it-expire',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: translate( "I'm going to let this %(productType)s expire.", {
					args: { productType },
				} ) as string,
			},

			{
				value: 'manual-renew',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: translate( "I'm going to renew the %(productType)s, but will do it manually.", {
					args: { productType },
				} ) as string,
			},
			{
				value: 'not-sure',
				label: translate( "I'm not sure." ) as string,
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
		const { translate, isVisible, onClose, purchase } = this.props;

		const productType = this.getProductTypeString();

		if ( ! isVisible ) {
			return null;
		}

		return (
			<ConfirmDialog
				onRequestClose={ onClose }
				title={ translate( 'Help us improve' ) }
				className="cancel-auto-renewal-form__dialog"
			>
				<DialogContent>
					<FormFieldset className="cancel-auto-renewal-form__form-fieldset">
						<p>{ translate( "You've turned off auto-renewal." ) }</p>
						<p>
							{ translate(
								"Before you go, we'd love to know: " +
									"are you letting this %(productType)s expire completely, or do you think you'll renew it manually?",
								{
									args: { productType },
									comment: '%(productType)s will be either "plan", "domain", or "subscription".',
								}
							) }
						</p>
						<RadioControl
							className="cancel-auto-renewal-form__radio-control"
							hideLabelFromVision
							options={ this.radioButtons }
							selected={ this.state.response }
							onChange={ this.onRadioChange }
						/>
					</FormFieldset>
				</DialogContent>
				<DialogFooter>
					<PrecancellationChatButton
						purchase={ purchase }
						onClick={ onClose }
						className="cancel-auto-renewal-form__chat-button"
					/>
					<Button onClick={ onClose } variant="tertiary">
						{ translate( 'Skip' ) }
					</Button>
					<Button onClick={ this.onSubmit } variant="primary" disabled={ ! this.state.response }>
						{ translate( 'Submit' ) }
					</Button>
				</DialogFooter>
			</ConfirmDialog>
		);
	}
}

export default connect( null, { submitSurvey } )( localize( CancelAutoRenewalForm ) );
