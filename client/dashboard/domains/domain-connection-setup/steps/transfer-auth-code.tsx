import { checkDomainAuthCode, startDomainInboundTransfer } from '@automattic/api-core';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Notice from '../../../components/notice';
import { TransferStepComponentProps } from '../types';

export function TransferAuthCode( { domainName, siteId }: TransferStepComponentProps ) {
	const [ authCode, setAuthCode ] = useState( '' );
	const [ isValidating, setIsValidating ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const navigate = useNavigate();

	const handleValidate = async () => {
		if ( ! authCode.trim() ) {
			setError( __( 'Please enter an authorization code.' ) );
			return;
		}

		if ( ! siteId ) {
			setError( __( 'Site ID is missing. Please try again.' ) );
			return;
		}

		setError( null );
		setIsValidating( true );

		try {
			const authCodeResult = await checkDomainAuthCode( domainName, authCode );

			if ( ! authCodeResult.success ) {
				setError( __( 'The authorization code is incorrect. Please check and try again.' ) );
				setIsValidating( false );
				return;
			}

			await startDomainInboundTransfer( siteId, domainName, authCode );

			navigate( {
				to: '/domains/$domainName',
				params: { domainName },
			} );
		} catch ( err ) {
			const errorMessage =
				err instanceof Error ? err.message : __( 'An unexpected error occurred.' );
			setError(
				sprintf(
					/* translators: %s: error message */
					__( 'Failed to start transfer: %s' ),
					errorMessage
				)
			);
			setIsValidating( false );
		}
	};

	return (
		<VStack spacing={ 6 }>
			{ error && <Notice variant="error">{ error }</Notice> }
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Heading level="3">
							{ sprintf(
								/* translators: %s: the domain name that is being transferred (ex.: example.com) */
								__( 'Enter the authorization code for %s.' ),
								domainName
							) }
						</Heading>
						<Text as="p">
							{ __(
								'A domain authorization code is a unique code linked only to your domain, it might also be called a secret code, auth code, or EPP code. You can usually find this in your domain settings page.'
							) }
						</Text>

						<InputControl
							__next40pxDefaultSize
							label={ __( 'Authorization code' ) }
							placeholder={ __( 'Enter authorization code' ) }
							value={ authCode }
							onChange={ ( value: string | undefined ) => {
								setAuthCode( value || '' );
								setError( null );
							} }
							disabled={ isValidating }
						/>

						<Text as="p">
							{ __(
								'Once you’ve entered the authorization code, click on the button below to proceed.'
							) }
						</Text>

						<HStack justify="flex-start">
							<Button
								variant="primary"
								onClick={ handleValidate }
								isBusy={ isValidating }
								disabled={ isValidating }
							>
								{ __( 'Initiate domain name transfer' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
