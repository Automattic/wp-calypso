import { validateTwoStepAuthCodeMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	Button,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { ButtonStack } from '../../../components/button-stack';
import { Notice } from '../../../components/notice';
import type { Field } from '@wordpress/dataviews';

interface VerifyCodeFormProps {
	actionType: 'enable-two-step' | 'create-backup-receipt';
	customField?: { label?: string; placeholder?: string; hideLabelFromVision?: boolean };
	onSuccess?: () => void;
	onError?: ( e: Error ) => void;
	primaryButtonText?: string;
	showCancelButton?: boolean;
	infoNoticeText?: string;
	resendButtonProps?: {
		onClick: () => void;
		isBusy: boolean;
		disabled: boolean;
	};
}

type TwoStepAuthAppFormData = {
	code: string;
};

export default function VerifyCodeForm( {
	actionType,
	customField,
	onSuccess,
	onError,
	primaryButtonText,
	showCancelButton = true,
	infoNoticeText,
	resendButtonProps,
}: VerifyCodeFormProps ) {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();

	const [ formData, setFormData ] = useState< TwoStepAuthAppFormData >( {
		code: '',
	} );

	const { mutate: validateTwoStepCode, isPending: isValidateTwoStepCodePending } = useMutation(
		validateTwoStepAuthCodeMutation()
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		recordTracksEvent( 'calypso_dashboard_security_two_step_auth_verify_code_form_submit', {
			action: actionType,
		} );
		validateTwoStepCode(
			{
				code: formData.code,
				action: actionType,
			},
			{
				onSuccess: () => {
					onSuccess?.();
				},
				onError: ( e: Error ) => {
					onError?.( e );
				},
			}
		);
	};

	const field: Field< TwoStepAuthAppFormData > = useMemo(
		() => ( {
			id: 'code',
			type: 'text',
			label: customField?.label || __( 'Code' ),
			placeholder: customField?.placeholder || '123456',
			Edit: ( { field, data, onChange } ) => {
				const { id, getValue } = field;
				return (
					<InputControl
						hideLabelFromVision={ customField?.hideLabelFromVision || false }
						__next40pxDefaultSize
						type="text"
						label={ field.label }
						placeholder={ field.placeholder }
						value={ getValue( { item: data } ) }
						onChange={ ( value ) => {
							return onChange( { [ id ]: value ?? '' } );
						} }
						disabled={ isValidateTwoStepCodePending }
					/>
				);
			},
		} ),
		[ customField, isValidateTwoStepCodePending ]
	);

	return (
		<>
			{ infoNoticeText && <Notice variant="info">{ infoNoticeText }</Notice> }
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< TwoStepAuthAppFormData >
						data={ formData }
						fields={ [ field ] }
						form={ { layout: { type: 'regular' as const }, fields: [ field ] } }
						onChange={ ( edits: Partial< TwoStepAuthAppFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<ButtonStack justify="flex-start">
						<Button
							variant="primary"
							type="submit"
							isBusy={ isValidateTwoStepCodePending }
							disabled={ ! formData.code || isValidateTwoStepCodePending }
						>
							{ primaryButtonText ?? __( 'Enable' ) }
						</Button>

						{ resendButtonProps && (
							<Button
								variant="secondary"
								onClick={ resendButtonProps.onClick }
								isBusy={ resendButtonProps.isBusy }
								disabled={ resendButtonProps.disabled || isValidateTwoStepCodePending }
							>
								{ __( 'Resend code' ) }
							</Button>
						) }

						{ showCancelButton && (
							<Button
								variant="tertiary"
								onClick={ () => router.navigate( { to: '/me/security/two-step-auth' } ) }
							>
								{ __( 'Cancel' ) }
							</Button>
						) }
					</ButtonStack>
				</VStack>
			</form>
		</>
	);
}
