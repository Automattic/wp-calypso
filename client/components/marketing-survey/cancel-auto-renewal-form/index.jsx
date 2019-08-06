/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import { submitSurvey } from 'lib/upgrades/actions';
import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import PrecancellationChatButton from 'components/marketing-survey/cancel-purchase-form/precancellation-chat-button';
import './style.scss';

class CancelAutoRenewalForm extends Component {
	static propTypes = {
		purchase: PropTypes.object.isRequired,
		selectedSite: PropTypes.object.isRequired,
		isVisible: PropTypes.bool,
		onClose: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		response: '',
	};

	radioButtons = {};

	constructor( props ) {
		super( props );

		const { translate } = props;

		this.radioButtons = [
			[ 'let-it-expire', translate( "I'm going to let this plan expire." ) ],
			[ 'manual-renew', translate( "I'm going to renew the plan, but will do it manually." ) ],
			[ 'not-sure', translate( "I'm not sure." ) ],
		];
	}

	onSubmit = () => {
		const { purchase, selectedSite } = this.props;
		const { response } = this.state;

		const surveyData = {
			response,
		};

		submitSurvey(
			'calypso-cancel-auto-renewal',
			selectedSite.ID,
			enrichedSurveyData( surveyData, moment(), selectedSite, purchase )
		);

		this.props.onClose();
	};

	onRadioChange = event => {
		this.setState( {
			response: event.currentTarget.value,
		} );
	};

	createRadioButton = ( value, text ) => {
		// adding `key` for resolving the unique key prop requirement when performing `map`
		return (
			<FormLabel key={ value }>
				<FormRadio
					value={ value }
					onChange={ this.onRadioChange }
					checked={ this.state.response === value }
				/>
				<span>{ text }</span>
			</FormLabel>
		);
	};

	render() {
		const { translate, isVisible, purchase, onClose } = this.props;
		const { response } = this.state;

		const disableSubmit = ! response;

		return (
			<Dialog
				className="cancel-auto-renewal-form__dialog"
				isVisible={ isVisible }
				onClose={ onClose }
			>
				<FormSectionHeading className="cancel-auto-renewal-form__header">
					{ translate( 'Your thoughts are needed.' ) }
				</FormSectionHeading>
				<FormFieldset>
					<p>
						{ translate(
							"Auto-renewal is now off. Before you go, we'd love to know: " +
								"are you letting this plan expire completely, or do you think you'll renew it manually?"
						) }
					</p>
					{ this.radioButtons.map( radioButton =>
						this.createRadioButton( radioButton[ 0 ], radioButton[ 1 ] )
					) }
				</FormFieldset>

				<FormButtonsBar>
					<FormButton onClick={ this.onSubmit } disabled={ disableSubmit }>
						{ translate( 'Submit' ) }
					</FormButton>
					<FormButton isPrimary={ false } onClick={ onClose }>
						{ translate( 'Skip' ) }
					</FormButton>
					<PrecancellationChatButton purchase={ purchase } onClick={ onClose } />
				</FormButtonsBar>
			</Dialog>
		);
	}
}

export default connect()( localize( CancelAutoRenewalForm ) );
