import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import { Button, RadioControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { shuffle } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import enrichedSurveyData from 'calypso/components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import PrecancellationChatButton from 'calypso/components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import { submitSurvey } from 'calypso/lib/purchases/actions';
import './style.scss';

class CancelAutoRenewalForm extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		response: '',
	};

	radioButtons = {};

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

	constructor( props ) {
		super( props );

		const { translate } = props;
		const productType = this.getProductTypeString();

		this.radioButtons = shuffle( [
			{
				value: 'let-it-expire',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: translate( "I'm going to let this %(productType)s expire.", {
					args: { productType },
				} ),
			},

			{
				value: 'manual-renew',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				label: translate( "I'm going to renew the %(productType)s, but will do it manually.", {
					args: { productType },
				} ),
			},
			{
				value: 'not-sure',
				label: translate( "I'm not sure." ),
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

	onRadioChange = ( value ) => {
		this.setState( {
			response: value,
		} );
	};

	renderButtons = () => {
		const { translate, purchase, onClose } = this.props;
		const { response } = this.state;
		const disableSubmit = ! response;

		const skip = {
			action: 'skip',
			disabled: false,
			label: translate( 'Skip' ),
			onClick: onClose,
		};

		const submit = {
			action: 'submit',
			isPrimary: true,
			disabled: disableSubmit,
			label: translate( 'Submit' ),
			onClick: this.onSubmit,
		};

		const chat = (
			<PrecancellationChatButton
				purchase={ purchase }
				onClick={ onClose }
				className="cancel-auto-renewal-form__chat-button"
			/>
		);

		return [ skip, submit, chat ];
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
						label={ translate( 'Need help?' ) }
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
