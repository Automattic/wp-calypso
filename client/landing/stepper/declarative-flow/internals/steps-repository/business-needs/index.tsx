/* eslint-disable no-console */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadio from 'calypso/components/forms/form-radio';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE, USER_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';

const BusinessNeeds: Step = function BusinessNeeds( { navigation } ) {
	const { goBack, goNext, submit } = navigation;
	const [ businessNeed, setBusinessNeed ] = React.useState( '' );
	const translate = useTranslate();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const { setBusinessNeed: saveBusinessNeedToStore } = useDispatch( ONBOARD_STORE );

	const handleSubmit = async ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( currentUser || newUser ) {
			saveBusinessNeedToStore( businessNeed );
			recordTracksEvent( 'calypso_signup_business_needs_submit', {
				has_business_need: !! businessNeed,
			} );

			submit?.( {
				businessNeed: businessNeed,
			} );
		}
	};
	const onChange = ( event: React.FormEvent< HTMLInputElement | HTMLSelectElement > ) => {
		if ( currentUser || newUser ) {
			switch ( event.currentTarget.name ) {
				case 'businessNeed':
					return setBusinessNeed( event.currentTarget.value );
			}
		}
	};

	const stepContent = (
		<form className="business-needs__form" onSubmit={ handleSubmit }>
			<FormFieldset className="business-needs__form-fieldset">
				<div className="business-needs__radio-container">
					<FormRadio
						name="businessNeed"
						value="just_starting"
						className="business-needs__just-starting"
						// checked={ this.state.show_to_logged_in }
						onChange={ onChange }
						label={ translate( "I'm just starting my business." ) }
					/>
				</div>
				<div className="business-needs__radio-container">
					<FormRadio
						name="businessNeed"
						value="not_online"
						className="business-needs__not-online"
						// checked={ this.state.show_to_logged_in }
						onChange={ onChange }
						label={ translate( "I'm selling but not online." ) }
					/>
				</div>
				<div className="business-needs__radio-container">
					<FormRadio
						name="businessNeed"
						value="already_online"
						className="business-needs__already-online"
						// checked={ this.state.show_to_logged_in }
						onChange={ onChange }
						label={ translate( "I'm already selling online." ) }
					/>
				</div>
			</FormFieldset>

			<Button className="business-needs__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);

	return (
		<StepContainer
			stepName="business-needs"
			skipButtonAlign="top"
			goBack={ goBack }
			goNext={ goNext }
			formattedHeader={
				<FormattedHeader
					id="business-needs-header"
					headerText={ translate( 'Which of these best describes you?' ) }
					subHeaderText={ translate( "We'll help you get started based on your business needs." ) }
					align="center"
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default BusinessNeeds;
