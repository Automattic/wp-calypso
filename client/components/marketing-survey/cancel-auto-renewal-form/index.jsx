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
import FormTextInput from 'components/forms/form-text-input';
import { submitSurvey } from 'lib/upgrades/actions';
import enrichedSurveyData from 'components/marketing-survey/cancel-purchase-form/enriched-survey-data';
import './style.scss';

const OTHER_FEEDBACK = 'other-feedback';

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
		feedback: '',
	};

	radioButtons = {};

	constructor( props ) {
		super( props );

		const { translate } = props;

		this.radioButtons = [
			[ 'take-a-break', translate( "Yes, I'm just taking a break for now." ) ],
			[ 'manual-renew', translate( 'Yes, I want to renew manually.' ) ],
			[ 'stop-renew', translate( 'No, I don’t have any plans to renew it.' ) ],
			[ OTHER_FEEDBACK, translate( 'Another reason' ) ],
		];
	}

	onSubmit = () => {
		const { purchase, selectedSite } = this.props;
		const { response, feedback } = this.state;

		const surveyData = {
			response,
			feedback: feedback.trim(),
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

	onEnterFeedback = event => {
		this.setState( {
			feedback: event.target.value,
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
		const { translate, isVisible, onClose } = this.props;
		const { response, feedback } = this.state;

		const disableSubmit = ! response || ( response === OTHER_FEEDBACK && ! feedback.trim() );

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
							'We have processed your request. Your feedback could help us improve our products.' +
								'Do you think you might use your current subscription after it expires?'
						) }
					</p>
					{ this.radioButtons.map( radioButton =>
						this.createRadioButton( radioButton[ 0 ], radioButton[ 1 ] )
					) }
					{ response === OTHER_FEEDBACK && (
						<FormTextInput
							placeholder={ translate( 'Please enter your feedback here.' ) }
							value={ feedback }
							onChange={ this.onEnterFeedback }
						/>
					) }
				</FormFieldset>

				<FormButtonsBar>
					<FormButton onClick={ this.onSubmit } disabled={ disableSubmit }>
						{ translate( 'Submit' ) }
					</FormButton>
					<FormButton isPrimary={ false } onClick={ onClose }>
						{ translate( 'Skip' ) }
					</FormButton>
				</FormButtonsBar>
			</Dialog>
		);
	}
}

export default connect()( localize( CancelAutoRenewalForm ) );
