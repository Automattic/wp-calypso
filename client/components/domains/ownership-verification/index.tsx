import {
	Button,
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	ExternalLink,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { createInterpolateElement, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Notice } from 'calypso/dashboard/components/notice';

import './index.scss';

interface OwnershipVerificationFormData {
	authCode: string;
}

type OwnershipVerificationError = Error | { message?: string; error?: string } | null | undefined;

interface OwnershipVerificationProps {
	domainName: string;
	onConnect: (
		data: {
			verificationData: {
				ownership_verification_data: { verification_type: string; verification_data: string };
			};
			domain: string;
		},
		callback: ( error: OwnershipVerificationError ) => void
	) => void;
}

export default function OwnershipVerification( {
	domainName,
	onConnect,
}: OwnershipVerificationProps ) {
	const [ formData, setFormData ] = useState< OwnershipVerificationFormData >( {
		authCode: '',
	} );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const fields: Field< OwnershipVerificationFormData >[] = useMemo(
		() => [
			{
				id: 'authCode',
				label: __( 'Authorization code' ),
				type: 'text' as const,
				isValid: {
					required: true,
				},
			},
		],
		[]
	);

	const form = {
		fields: [ 'authCode' ],
		layout: {
			type: 'regular' as const,
		},
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		setIsSubmitting( true );

		onConnect(
			{
				verificationData: {
					ownership_verification_data: {
						verification_type: 'auth_code',
						verification_data: formData.authCode,
					},
				},
				domain: domainName,
			},
			( error ) => {
				setIsSubmitting( false );
				if ( error ) {
					const errorMessage =
						error instanceof Error
							? error.message
							: error.message ||
							  error.error ||
							  __( 'An error occurred while connecting the domain.' );
					setError( errorMessage );
				}
			}
		);
	};

	return (
		<Card className="ownership-verification">
			<CardBody>
				<VStack spacing={ 4 }>
					<Text size="15px" weight={ 500 }>
						{ __( 'Enter the authorization code for your domain.' ) }
					</Text>
					<Text variant="muted">
						{ createInterpolateElement(
							__(
								'Log in to your domain provider’s account and find the authorization code for <domain/>. If you are not sure who your provider is, use the <link>lookup tool</link> and check the Registrar or Reseller fields.'
							),
							{
								domain: <b>{ domainName }</b>,
								link: <ExternalLink href="https://wordpress.com/site-profiler" children={ null } />,
							}
						) }
					</Text>
					<Notice variant="info">
						{ __(
							'This will only be used to verify that you own this domain, we will not transfer it.'
						) }
					</Notice>
					<form onSubmit={ handleSubmit } style={ { maxWidth: '260px' } }>
						<VStack spacing={ 4 }>
							<DataForm< OwnershipVerificationFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< OwnershipVerificationFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>

							<HStack>
								<Button
									__next40pxDefaultSize
									variant="primary"
									type="submit"
									isBusy={ isSubmitting }
									disabled={ isSubmitting }
								>
									{ __( 'Connect domain' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
					{ error && <Notice variant="error"> { error }</Notice> }
				</VStack>
			</CardBody>
		</Card>
	);
}
