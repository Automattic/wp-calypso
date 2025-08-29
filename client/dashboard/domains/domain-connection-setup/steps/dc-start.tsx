import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { external } from '@wordpress/icons';
import { useCallback } from 'react';
import Notice from '../../../components/notice';
import Progress from '../components/progress';
import type { StepComponentProps } from '../types';

export default function DomainConnectStart( {
	domain,
	progressStepList,
	pageSlug,
	onVerifyConnection,
	domainSetupInfo,
}: StepComponentProps ) {
	const { data } = domainSetupInfo || {};
	const domainConnectURL =
		typeof data?.domain_connect_apply_wpcom_hosting === 'string'
			? data.domain_connect_apply_wpcom_hosting
			: undefined;
	const showProgress = Object.keys( progressStepList ).includes( pageSlug );

	const handleStartSetup = useCallback( () => {
		if ( onVerifyConnection ) {
			onVerifyConnection( false );
		}
		if ( domainConnectURL ) {
			window.location.href = domainConnectURL;
		}
	}, [ onVerifyConnection, domainConnectURL ] );

	return (
		<VStack spacing={ 6 }>
			{ showProgress && <Progress steps={ progressStepList } currentStep={ pageSlug } /> }

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<p>
							{ sprintf(
								/* translators: %1s is the field to copy */
								__(
									'Good news! Your DNS provider for %1s supports a simple click-through way to connect your domain to WordPress.com. Use the button below and follow the on-screen instructions. You might need to log in to your DNS provider account so make sure you have your credentials at hand.'
								),
								domain
							) }
						</p>

						<Notice variant="info" title={ __( 'How long will it take?' ) }>
							{ __( 'It takes 2 minutes to set up.' ) }
							<br />
							{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
						</Notice>

						<HStack justify="flex-start">
							<Button
								variant="primary"
								onClick={ handleStartSetup }
								disabled={ ! domainConnectURL }
								icon={ external }
							>
								{ __( 'Start setup' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
