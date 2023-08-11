import { isDomainRegistration, isPlan } from '@automattic/calypso-products';
import { Dialog, FormLabel } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { shuffle } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
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
			[
				'let-it-expire',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				translate( "I'm going to let this %(productType)s expire.", {
					args: { productType },
				} ),
			],
			[
				'manual-renew',
				/* translators: %(productType)s will be either "plan", "domain", or "subscription". */
				translate( "I'm going to renew the %(productType)s, but will do it manually.", {
					args: { productType },
				} ),
			],
			[ 'not-sure', translate( "I'm not sure." ) ],
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

	onRadioChange = ( event ) => {
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
					label={ text }
				/>
			</FormLabel>
		);
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
		const { translate, isVisible, onClose } = this.props;

		const productType = this.getProductTypeString();

		return (
			<Dialog
				className="cancel-auto-renewal-form__dialog"
				isVisible={ isVisible }
				buttons={ this.renderButtons() }
				onClose={ onClose }
			>
				<FormSectionHeading className="cancel-auto-renewal-form__header">
					{ translate( 'Your thoughts are needed.' ) }
				</FormSectionHeading>
				<FormFieldset className="cancel-auto-renewal-form__form-fieldset">
					<p>
						{ translate(
							"Auto-renewal is now off. Before you go, we'd love to know: " +
								"are you letting this %(productType)s expire completely, or do you think you'll renew it manually?",
							{
								args: { productType },
								comment: '%(productType)s will be either "plan", "domain", or "subscription".',
							}
						) }
					</p>
					{ this.radioButtons.map( ( radioButton ) =>
						this.createRadioButton( radioButton[ 0 ], radioButton[ 1 ] )
					) }
				</FormFieldset>
			</Dialog>
		);
	}
}

export default connect( null, { submitSurvey } )( localize( CancelAutoRenewalForm ) );
