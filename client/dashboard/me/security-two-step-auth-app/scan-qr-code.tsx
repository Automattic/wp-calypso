import { appAuthSetupQuery, validateTwoStepCodeMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { SectionHeader } from '../../components/section-header';
import type { Field } from '@wordpress/dataviews';

type TwoStepAuthAppFormData = {
	code: string;
};

export default function ScanQRCode() {
	const router = useRouter();

	const [ formData, setFormData ] = useState< TwoStepAuthAppFormData >( {
		code: '',
	} );

	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: appAuthSetup } = useQuery( appAuthSetupQuery() );
	const { mutate: validateTwoStepCode, isPending: isValidateTwoStepCodePending } = useMutation(
		validateTwoStepCodeMutation()
	);

	const handleCopy = () => {
		createSuccessNotice( __( 'Setup key copied to clipboard.' ), {
			type: 'snackbar',
		} );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		validateTwoStepCode(
			{
				code: formData.code,
				action: 'enable-two-step',
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Two-step authentication enabled.' ), {
						type: 'snackbar',
					} );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to enable two-step authentication.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const fields: Field< TwoStepAuthAppFormData >[] = useMemo(
		() => [
			{
				id: 'code',
				type: 'text',
				label: __( 'Code' ),
				placeholder: '123456',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<InputControl
							hideLabelFromVision
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
			},
		],
		[ isValidateTwoStepCodePending ]
	);

	if ( ! appAuthSetup ) {
		return null;
	}

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Scan the QR code' ) } level={ 3 } />
						<Text>
							{ __( 'Use your authenticator app or browser extension to scan the QR code.' ) }
						</Text>
						<QRCodeSVG value={ appAuthSetup.otpauth_uri } size={ 150 } />
						<Text>{ __( 'Unable to scan? Manually enter the setup key below instead.' ) }</Text>
						<ClipboardInputControl
							value={ appAuthSetup.time_code }
							readOnly
							onCopy={ handleCopy }
						/>
					</VStack>
				</CardBody>
			</Card>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Enter the six-digit code from the app' ) } level={ 3 } />
						<form onSubmit={ handleSubmit }>
							<VStack spacing={ 4 }>
								<DataForm< TwoStepAuthAppFormData >
									data={ formData }
									fields={ fields }
									form={ { layout: { type: 'regular' as const }, fields } }
									onChange={ ( edits: Partial< TwoStepAuthAppFormData > ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<HStack spacing={ 3 } justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isValidateTwoStepCodePending }
										disabled={ ! formData.code || isValidateTwoStepCodePending }
									>
										{ __( 'Enable' ) }
									</Button>

									<Button
										variant="tertiary"
										onClick={ () => router.navigate( { to: '/me/security/two-step-auth' } ) }
									>
										{ __( 'Cancel' ) }
									</Button>
								</HStack>
							</VStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
