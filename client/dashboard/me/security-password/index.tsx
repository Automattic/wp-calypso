import { userSettingsMutation } from '@automattic/api-queries';
import { generatePassword } from '@automattic/generate-password';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { seen, unseen } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import FlashMessage from '../../components/flash-message';
import PageLayout from '../../components/page-layout';
import SecurityPageHeader from '../security-page-header';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

type SecurityPasswordFormData = {
	password: string;
};

export default function SecurityPassword() {
	const mutation = useMutation( userSettingsMutation() );
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ isReloading, setIsReloading ] = useState( false );

	const [ isPasswordVisible, setIsPasswordVisible ] = useState( false );
	const [ formData, setFormData ] = useState< SecurityPasswordFormData >( {
		password: '',
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate(
			{ password: formData.password },
			{
				onSuccess: () => {
					// Since changing a user's password invalidates the session, we reload.
					setIsReloading( true );
					window.location.replace( '?updated=password' );
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message || __( 'Failed to save password.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const handleGeneratePassword = () => {
		setFormData( ( data ) => ( {
			...data,
			password: generatePassword(),
		} ) );
	};

	const fields: Field< SecurityPasswordFormData >[] = useMemo(
		() => [
			{
				id: 'password',
				label: __( 'New password' ),
				description: __(
					'If you can’t think of a good password, use the button below to generate one.'
				),
				type: 'text' as const,
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							__next40pxDefaultSize
							type={ isPasswordVisible ? 'text' : 'password' }
							label={ field.label }
							placeholder={ field.placeholder }
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value ?? '' } );
							} }
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
					);
				},
				// TODO: Add validation via isValid.custom.
				// There is currently a bug that prevents it from working.
			},
		],
		[ isPasswordVisible ]
	);

	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Password' ) }
					description={ __(
						'Strong passwords have at least six characters, and use upper and lower case letters, numbers, and symbols like ! ” ? $ % ^ & ).'
					) }
				/>
			}
		>
			<FlashMessage value="password" message={ __( 'Your password was saved successfully.' ) } />
			<Card className="security-password-card">
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< SecurityPasswordFormData >
								data={ formData }
								fields={ fields }
								form={ { layout: { type: 'regular' as const }, fields } }
								onChange={ ( edits: Partial< SecurityPasswordFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ mutation.isPending || isReloading }
									disabled={ mutation.isPending || isReloading }
								>
									{ __( 'Save' ) }
								</Button>
								<Button variant="secondary" onClick={ handleGeneratePassword }>
									{ __( 'Generate strong password' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
