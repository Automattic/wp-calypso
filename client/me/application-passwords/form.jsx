import { FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

export default function NewAppPasswordForm( {
	isSubmitting,
	addingPassword,
	onSubmit,
	onClickCancel,
	onClickGenerate,
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ appName, setAppName ] = useState( '' );

	const cardClasses = clsx( 'application-passwords__add-new-card', {
		'is-visible': addingPassword,
	} );

	return (
		<div className={ cardClasses }>
			<form
				id="add-application-password"
				className="application-passwords__add-new"
				onSubmit={ ( event ) => {
					event.preventDefault();
					onSubmit?.( appName );
				} }
			>
				<FormFieldset>
					<FormLabel htmlFor="application-name">{ translate( 'Application name' ) }</FormLabel>
					<FormTextInput
						className="application-passwords__add-new-field"
						disabled={ isSubmitting }
						id="application-name"
						name="applicationName"
						onFocus={ () =>
							dispatch( recordGoogleEvent( 'Me', 'Focused on Application Name Field' ) )
						}
						value={ appName }
						onChange={ ( e ) => setAppName( e.target.value ) }
					/>
				</FormFieldset>

				<FormButtonsBar>
					<FormButton disabled={ isSubmitting || '' === appName } onClick={ onClickGenerate }>
						{ isSubmitting
							? translate( 'Generating Password…' )
							: translate( 'Generate Password' ) }
					</FormButton>
					<FormButton isPrimary={ false } type="button" onClick={ onClickCancel }>
						{ translate( 'Cancel' ) }
					</FormButton>
				</FormButtonsBar>
			</form>
		</div>
	);
}
