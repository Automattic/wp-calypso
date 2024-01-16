import { Button, FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import RoleSelect from 'calypso/my-sites/people/role-select';
import { useSelector, useDispatch } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { useInitialRole, useIncludeFollowers } from '../shared/hooks';
import type { ChangeEvent, FormEvent } from 'react';

interface CreateFormProps {
	siteId: number;
}

const CreateForm = ( { siteId }: CreateFormProps ) => {
	const translate = useTranslate();
	const defaultUserRole = useInitialRole( siteId );
	const includeFollowers = useIncludeFollowers( siteId );

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const includeSubscribers = isAtomic;

	const [ role, setRole ] = useState( defaultUserRole );

	const onFormSubmit = ( e: FormEvent ) => {
		e.preventDefault();
		console.log( 'SUBMIT' );
	};

	function getRoleLearnMoreLink() {
		return (
			<Button
				plain={ true }
				target="_blank"
				href={ localizeUrl( 'https://wordpress.com/support/user-roles/' ) }
			>
				{ translate( 'Learn more' ) }
			</Button>
		);
	}

	return (
		<form onSubmit={ onFormSubmit }>
			<RoleSelect
				id="role"
				name="role"
				siteId={ siteId }
				onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => setRole( e.target.value ) }
				value={ role }
				disabled={ false }
				includeFollower={ includeFollowers }
				includeSubscriber={ includeSubscribers }
				explanation={ getRoleLearnMoreLink() }
				formControlType="select"
			/>

			<FormFieldset>
				{ ! showMsg && (
					<Button
						className="team-invite-form__add-message"
						primary={ true }
						borderless={ true }
						onClick={ () => setShowMsg( true ) }
					>
						{ translate( '+ Add a message' ) }
					</Button>
				) }
				{ showMsg && (
					<>
						<FormLabel htmlFor="message">{ translate( 'Message' ) }</FormLabel>
						<FormTextarea
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							id="message"
							value={ message }
							placeholder={ translate( 'This message will be sent along with invitation emails.' ) }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setMessage( e.target.value ) }
						/>
					</>
				) }
			</FormFieldset>
			<Button
				type="submit"
				primary
				// busy={ invitingProgress }
				className="team-invite-form__submit-btn"
			>
				{ translate( 'Create user' ) }
			</Button>
		</form>
	);
};

export default CreateForm;
