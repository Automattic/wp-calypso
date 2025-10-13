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
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

const AddProfessionalEmail = () => {
	const router = useRouter();
	const [ isPasswordVisible, setIsPasswordVisible ] = useState( false );
	// Extract params from the current match for this route
	const match = router.state.matches[ router.state.matches.length - 1 ];
	const params = ( match?.params ?? {} ) as { domain?: string; type?: string };
	const { domain = '' } = params;

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<InputControl
							__next40pxDefaultSize
							label={ __( 'Email address' ) }
							suffix={ <InputControlSuffixWrapper>{ `@${ domain }` }</InputControlSuffixWrapper> }
						/>

						<VStack>
							<InputControl
								__next40pxDefaultSize
								type={ isPasswordVisible ? 'text' : 'password' }
								label={ __( 'Password' ) }
								// value={ getValue( { item: data } ) }
								// onChange={ ( value ) => {
								// 	return onChange( { [ id ]: value ?? '' } );
								// } }
								// disabled={ isLoading }
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
										{ userEmail: 'user@example.com' }
									),
									{
										strong: <strong />,
										passwordChangeLink: <a href="#change-password" />,
									}
								) }
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			<ButtonStack justify="flex-start">
				<Button __next40pxDefaultSize variant="secondary">
					{ __( 'Add another mailbox' ) }
				</Button>
			</ButtonStack>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
