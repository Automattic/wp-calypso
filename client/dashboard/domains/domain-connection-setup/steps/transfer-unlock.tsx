import { fetchDomainInboundTransferStatus } from '@automattic/api-core';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lock } from '@wordpress/icons';
import { useState } from 'react';
import Notice from '../../../components/notice';
import { TransferStepComponentProps } from '../types';

export function TransferUnlock( {
	onNextStep,
	domainName,
	inboundTransferStatusInfo,
}: TransferStepComponentProps ) {
	const [ isChecking, setIsChecking ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const [ allowSkip, setAllowSkip ] = useState( false );

	const isInitiallyUnlocked = inboundTransferStatusInfo?.unlocked === true;
	const isInitiallyUnknown = inboundTransferStatusInfo?.unlocked === null;

	const handleCheckUnlock = async () => {
		setIsChecking( true );
		setError( null );

		try {
			const result = await fetchDomainInboundTransferStatus( domainName );

			if ( result.unlocked === true || allowSkip || isInitiallyUnknown ) {
				onNextStep();
			} else if ( result.unlocked === null ) {
				setError( __( "Can't get the domain's lock status" ) );
				setAllowSkip( true );
				setIsChecking( false );
			} else {
				setError( __( 'Your domain is still locked' ) );
				setIsChecking( false );
			}
		} catch {
			setError( __( "Can't get the domain's lock status" ) );
			setAllowSkip( true );
			setIsChecking( false );
		}
	};

	const getErrorMessage = () => {
		if ( allowSkip ) {
			return __(
				'Can’t get the domain’s lock status. If you’ve already unlocked it, wait a few minutes and try again.'
			);
		}
		return __(
			'Your domain is still locked. If you’ve already unlocked it, wait a few minutes and try again.'
		);
	};

	const getHeadingText = () => {
		if ( isInitiallyUnknown || allowSkip ) {
			return __( "Can't get the domain's lock status" );
		}
		return __( 'Your domain is locked' );
	};

	const getButtonText = () => {
		if ( isInitiallyUnknown || allowSkip ) {
			return __( 'Skip domain lock verification' );
		}
		return __( 'I’ve unlocked my domain' );
	};

	return (
		<VStack spacing={ 6 }>
			{ error && ! isChecking && <Notice variant="error">{ getErrorMessage() }</Notice> }
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ ! isInitiallyUnlocked && (
							<HStack justify="flex-start" alignment="center">
								<Icon icon={ lock } />
								<Heading level="3">{ getHeadingText() }</Heading>
							</HStack>
						) }
						<Text as="p">
							{ ( isInitiallyUnknown || allowSkip ) && (
								<>{ __( 'Please check that your domain is unlocked.' ) } </>
							) }
							{ __(
								'Domain providers lock domains to prevent unauthorized transfers. You’ll need to unlock it on your domain provider’s settings page. Some domain providers require you to contact them via their customer support to unlock it.'
							) }
						</Text>
						<Text as="p">
							{ __( 'It might take a few minutes for any changes to take effect.' ) }
							<br />
							{ __( 'Once you have unlocked your domain click on the button below to proceed.' ) }
						</Text>

						<HStack justify="flex-start">
							<Button
								variant="primary"
								onClick={ handleCheckUnlock }
								isBusy={ isChecking }
								disabled={ isChecking }
							>
								{ getButtonText() }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
