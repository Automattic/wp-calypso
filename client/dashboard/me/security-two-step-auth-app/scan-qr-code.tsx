import { appAuthSetupQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { QRCodeSVG } from 'qrcode.react';
import ClipboardInputControl from '../../components/clipboard-input-control';
import { SectionHeader } from '../../components/section-header';
import VerifyCodeForm from '../security-two-step-auth/common/verify-code-form';

export default function ScanQRCode() {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: appAuthSetup } = useSuspenseQuery( appAuthSetupQuery() );

	const handleCopy = () => {
		createSuccessNotice( __( 'Setup key copied to clipboard.' ), {
			type: 'snackbar',
		} );
	};

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
						<VerifyCodeForm
							actionType="enable-two-step"
							customField={ { hideLabelFromVision: true } }
							onSuccess={ () => {
								createSuccessNotice( __( 'Two-step authentication enabled.' ), {
									type: 'snackbar',
								} );
							} }
							onError={ ( err: Error ) => {
								const errorMessage =
									err.cause === 'invalid_code'
										? __( 'You entered an invalid code. Please try again.' )
										: __( 'Failed to enable two-step authentication.' );
								createErrorNotice( errorMessage, {
									type: 'snackbar',
								} );
							} }
						/>
					</VStack>
				</CardBody>
			</Card>
		</>
	);
}
