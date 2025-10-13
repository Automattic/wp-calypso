import { useRouter } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { seen, unseen } from '@wordpress/icons';
import { useState } from 'react';
import { useAuth } from '../../app/auth';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

interface FormState {
	localPart: string;
	password: string;
}

const EmailForm = ( {
	disabled = false,
	removeForm = undefined,
	state: { localPart, password },
	setState,
}: {
	disabled: boolean;
	removeForm?: () => void;
	state: FormState;
	setState: ( state: FormState ) => void;
} ) => {
	const { user } = useAuth();
	const router = useRouter();
	// Extract params from the current match for this route
	const match = router.state.matches[ router.state.matches.length - 1 ];
	const params = ( match?.params ?? {} ) as { domain?: string; type?: string };
	const { domain = '' } = params;
	const [ isPasswordVisible, setIsPasswordVisible ] = useState( false );

	return (
		<VStack spacing={ 4 }>
			<InputControl
				__next40pxDefaultSize
				label={ __( 'Email address' ) }
				value={ localPart }
				onChange={ ( value ) => setState( { localPart: value || '', password } ) }
				disabled={ disabled }
				suffix={ <InputControlSuffixWrapper>{ `@${ domain }` }</InputControlSuffixWrapper> }
			/>

			<VStack>
				<InputControl
					__next40pxDefaultSize
					type={ isPasswordVisible ? 'text' : 'password' }
					label={ __( 'Password' ) }
					value={ password }
					onChange={ ( value ) => setState( { localPart, password: value || '' } ) }
					disabled={ disabled }
					suffix={
						<InputControlSuffixWrapper>
							<Button
								icon={ isPasswordVisible ? unseen : seen }
								onClick={ () => {
									setIsPasswordVisible( ! isPasswordVisible );
								} }
							/>
						</InputControlSuffixWrapper>
					}
					// Hint to LastPass not to attempt autofill
					data-lpignore="true"
				/>

				<Text variant="muted">
					{ createInterpolateElement(
						sprintf(
							// Translators: %(userEmail)s is the email address that the user has currently configured as their password reset email.
							__(
								'Your password reset email is <strong>%(userEmail)s</strong>. <passwordChangeLink>Change it</passwordChangeLink>.'
							),
							{ userEmail: user?.email }
						),
						{
							strong: <strong />,
							passwordChangeLink: <a href="#change-password" />,
						}
					) }
				</Text>
			</VStack>

			{ removeForm && (
				<ButtonStack justify="flex-start">
					<Button
						__next40pxDefaultSize
						isDestructive
						variant="secondary"
						onClick={ removeForm }
						disabled={ disabled }
					>
						{ __( 'Remove mailbox' ) }
					</Button>
				</ButtonStack>
			) }
		</VStack>
	);
};

const AddProfessionalEmail = () => {
	const [ emailForms, setEmailForms ] = useState< FormState[] >( [
		{ localPart: '', password: '' },
	] );

	const removeForm = ( index: number ) => {
		const newForms = emailForms.filter( ( _, i ) => i !== index );
		setEmailForms( newForms );
	};

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			{ emailForms.map( ( state, index ) => (
				<Card key={ index }>
					<CardBody>
						<EmailForm
							disabled={ false }
							removeForm={ index > 0 ? () => removeForm( index ) : undefined }
							state={ state }
							setState={ ( newState ) => {
								const newEmailForms = [ ...emailForms ];
								newEmailForms[ index ] = newState;
								setEmailForms( newEmailForms );
							} }
						/>
					</CardBody>
				</Card>
			) ) }

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					onClick={ () => {
						setEmailForms( ( prevForms ) => [ ...prevForms, { localPart: '', password: '' } ] );
					} }
				>
					{ __( 'Add another mailbox' ) }
				</Button>
			</ButtonStack>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
