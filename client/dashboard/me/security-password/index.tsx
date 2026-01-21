import { validatePassword } from '@automattic/api-core';
import { userSettingsMutation } from '@automattic/api-queries';
import { generatePassword } from '@automattic/generate-password';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import useDebouncedState from '../../app/hooks/use-debounced-state';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import FlashMessage, { reloadWithFlashMessage } from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { Field, Form } from '@wordpress/dataviews';

import './style.scss';

type SecurityPasswordFormData = {
	password: string;
	confirmPassword: string;
};

const fields: Field< SecurityPasswordFormData >[] = [
	{
		id: 'password',
		label: __( 'New password' ),
		type: 'password' as const,
		isValid: {
			required: true,
			custom: async ( data: SecurityPasswordFormData ) => {
				const validation = await validatePassword( data.password );
				if ( ! validation.passed ) {
					return validation.test_results.failed[ 0 ].explanation;
				}

				return null;
			},
		},
	},
	{
		id: 'confirmPassword',
		label: __( 'Confirm new password' ),
		type: 'password' as const,
		isValid: {
			required: true,
		},
	},
];

const form: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [ 'password', 'confirmPassword' ],
};

export default function SecurityPassword() {
	const { recordTracksEvent } = useAnalytics();

	const mutation = useMutation( userSettingsMutation() );
	const { createErrorNotice } = useDispatch( noticesStore );
	const [ isReloading, setIsReloading ] = useState( false );

	const [ formData, setFormData, debouncedFormData ] =
		useDebouncedState< SecurityPasswordFormData >( {
			password: '',
			confirmPassword: '',
		} );

	const { validity: baseValidity, isValid: baseIsValid } = useFormValidity(
		debouncedFormData,
		fields,
		form
	);

	// Extract values for clearer useMemo dependencies
	const { password, confirmPassword } = debouncedFormData;

	// Always check password match since DataForm doesn't re-validate confirmPassword when password changes
	// Also remove confirmPassword validity when valid to hide the "Valid" indicator
	const { validity, isValid } = useMemo( () => {
		const passwordHasValue = password.length > 0;
		const confirmPasswordHasValue = confirmPassword.length > 0;
		const passwordsMatch = password === confirmPassword;

		// Show mismatch error when confirm has value but doesn't match
		if ( confirmPasswordHasValue && ! passwordsMatch ) {
			return {
				validity: {
					...baseValidity,
					confirmPassword: {
						custom: {
							type: 'invalid' as const,
							message: __( 'Passwords do not match.' ),
						},
					},
				},
				isValid: false,
			};
		}

		// When both fields have values and match, hide the "Valid" indicator
		// by removing confirmPassword from validity
		if ( passwordHasValue && confirmPasswordHasValue && passwordsMatch ) {
			const { confirmPassword: _, ...restValidity } = baseValidity ?? {};
			return {
				validity: Object.keys( restValidity ).length > 0 ? restValidity : undefined,
				isValid: baseIsValid,
			};
		}

		return { validity: baseValidity, isValid: baseIsValid };
	}, [ baseValidity, baseIsValid, password, confirmPassword ] );

	const isLoading = mutation.isPending || isReloading;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! isValid ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_security_password_save_password_click' );
		mutation.mutate(
			{ password: formData.password },
			{
				onSuccess: () => {
					setIsReloading( true );
					reloadWithFlashMessage( 'password' );
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
		recordTracksEvent( 'calypso_dashboard_security_password_generate_password_click' );
		const newPassword = generatePassword();
		setFormData( ( data ) => ( {
			...data,
			password: newPassword,
			confirmPassword: newPassword,
		} ) );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Password' ) }
					description={ __(
						'Strong passwords have at least six characters, and use upper and lower case letters, numbers, and symbols like ! ” ? $ % ^ & ). If you can’t think of a good password, use the button below to generate one.'
					) }
				/>
			}
		>
			<FlashMessage id="password" message={ __( 'Your password was saved successfully.' ) } />
			<Card className="security-password-card">
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< SecurityPasswordFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								validity={ validity }
								onChange={ ( edits: Partial< SecurityPasswordFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isLoading }
									disabled={ isLoading || ! isValid }
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
