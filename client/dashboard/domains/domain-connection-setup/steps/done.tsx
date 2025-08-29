import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import type { StepComponentProps } from '../types';

// TODO: This file needs full review of the copy and etc.
// I didn't move to gutenberg components so some things (and styles) can probably be removed and/or replaced
// Also I didn't review the copy for any of the messages
export default function Done( { step, verificationStatus }: StepComponentProps ) {
	const isConnected = step === 'connected';
	const { error } = verificationStatus || {};

	if ( error ) {
		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<h2>{ __( 'Connection Error' ) }</h2>

						<p>
							{ __(
								'We encountered an error while trying to verify your domain connection. Please check your DNS settings and try again.'
							) }
						</p>

						{ error.message && (
							<Card variant="secondary">
								<CardBody>
									<p>
										<strong>{ __( 'Error details:' ) }</strong> { error.message }
									</p>
								</CardBody>
							</Card>
						) }

						<HStack justify="flex-start">
							<Button variant="secondary">{ __( 'Try Again' ) }</Button>
							<Button variant="tertiary">{ __( 'Get Help' ) }</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		);
	}

	if ( isConnected ) {
		return (
			<VStack spacing={ 6 } style={ { textAlign: 'center', padding: '40px 20px' } }>
				<div style={ { fontSize: '48px', color: '#00A32A' } }>
					<Icon icon={ check } size={ 48 } />
				</div>

				<h2>
					<Icon icon={ check } size={ 18 } style={ { marginRight: '8px', color: '#00A32A' } } />
					{ __( 'Successfully connected!' ) }
				</h2>

				<p>
					{ __(
						'Your domain is now connected to WordPress.com. Your site should be accessible at your custom domain within the next few minutes.'
					) }
				</p>

				<p>
					{ __(
						"If your site isn't loading at your custom domain after a few hours, check that your DNS changes have been saved correctly at your domain provider."
					) }
				</p>

				<HStack justify="center">
					<Button variant="primary">{ __( 'Visit Your Site' ) }</Button>
					<Button variant="secondary">{ __( 'Manage Domain' ) }</Button>
				</HStack>
			</VStack>
		);
	}

	// Verifying state
	return (
		<VStack spacing={ 6 } style={ { textAlign: 'center', padding: '40px 20px' } }>
			<div style={ { fontSize: '24px' } }>🔄</div>

			<h2>{ __( 'Verifying connection…' ) }</h2>

			<p>
				{ __(
					"We're checking if your domain is properly connected to WordPress.com. This may take a few moments."
				) }
			</p>

			<p>
				{ __(
					"DNS changes can take up to 72 hours to fully propagate. If the verification doesn't complete immediately, that's normal."
				) }
			</p>

			<HStack justify="center">
				<Button variant="secondary">{ __( 'Check Again' ) }</Button>
				<Button variant="tertiary">{ __( 'Continue Without Waiting' ) }</Button>
			</HStack>
		</VStack>
	);
}
