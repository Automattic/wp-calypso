import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { type AddProfileLinksPayload } from '../../data/types';

import './style.scss';

type ProfileLinksAddOtherProps = {
	addUserProfileLinks: ( links: AddProfileLinksPayload ) => void;
	isAddingProfileLinks?: boolean;
	onCancel: () => void;
};

const ProfileLinksAddOther = ( {
	addUserProfileLinks,
	isAddingProfileLinks,
	onCancel,
}: ProfileLinksAddOtherProps ) => {
	const [ title, setTitle ] = useState( '' );
	const [ value, setValue ] = useState( '' );

	const translate = useTranslate();
	const dispatch = useDispatch();

	const recordClickEvent = ( action: string ) => {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on ' + action ) );
	};

	const recordFocusEvent = ( action: string ) => {
		dispatch( recordGoogleEvent( 'Me', 'Focused on ' + action ) );
	};

	const getFormDisabled = () => {
		const trimmedValue = value.trim();

		if ( ! title.trim() || ! trimmedValue ) {
			return true;
		}

		// Disallow spaces in the trimmed URL value
		if ( trimmedValue.includes( ' ' ) ) {
			return true;
		}

		// Minimalist domain regex.  Not meant to be bulletproof.
		// Requires at least one letter or number, then one dot, then
		// at least two letters
		if ( ! trimmedValue.match( /[a-zA-z0-9]+\.[a-zA-z]{2,}/ ) ) {
			return true;
		}

		// Scheme regex.  If a scheme is provided, it must be http or https
		if ( trimmedValue.match( /^.*:\/\// ) && ! trimmedValue.match( /^https?:\/\// ) ) {
			return true;
		}

		return false;
	};

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		// When the form's submit button is disabled, the form's onSubmit does not
		// get fired for ENTER presses in input text fields, so this check
		// for getFormDisabled is merely here out of an abundance of caution
		if ( getFormDisabled() || isAddingProfileLinks ) {
			return;
		}

		addUserProfileLinks( [
			{
				title: title.trim(),
				value: value.trim(),
			},
		] );
	};

	return (
		<form className="profile-links-add-other" onSubmit={ handleSubmit }>
			<p>
				{ translate(
					'Please enter the URL and description of the site you want to add to your profile.'
				) }
			</p>
			<FormFieldset className="profile-links-add-other__fieldset">
				<FormTextInput
					className="profile-links-add-other__value"
					placeholder={ translate( 'Enter a URL' ) }
					onFocus={ () => recordFocusEvent( 'Add Other Site URL Field' ) }
					name="value"
					value={ value }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setValue( event.target.value )
					}
				/>
				<FormTextInput
					className="profile-links-add-other__title"
					placeholder={ translate( 'Enter a description' ) }
					onFocus={ () => recordFocusEvent( 'Add Other Site Description Field' ) }
					name="title"
					value={ title }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
						setTitle( event.target.value )
					}
				/>
				<FormButton
					className="profile-links-add-other__add"
					disabled={ getFormDisabled() || isAddingProfileLinks }
					onClick={ () => recordClickEvent( 'Save Other Site Button' ) }
					busy={ isAddingProfileLinks }
				>
					{ translate( 'Add Site' ) }
				</FormButton>
				<FormButton
					className="profile-links-add-other__cancel"
					isPrimary={ false }
					onClick={ () => {
						recordClickEvent( 'Cancel Other Site Button' );
						onCancel?.();
					} }
				>
					{ translate( 'Cancel' ) }
				</FormButton>
			</FormFieldset>
		</form>
	);
};

export default ProfileLinksAddOther;
