import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	Icon,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { StepType, type StepComponentProps } from '../types';

// TODO: This file needs full review of the copy and etc.
// I didn't move to gutenberg components so some things (and styles) can probably be removed and/or replaced
// Also I didn't review the copy for any of the messages
export function Done( {
	stepType,
	domainName,
	queryError,
	queryErrorDescription,
}: StepComponentProps ) {
	const isConnected = stepType === StepType.CONNECTED;

	if ( queryError ) {
		let heading;
		let contentMessage;

		if ( queryError === 'access_denied' && queryErrorDescription?.startsWith( 'user_cancel' ) ) {
			heading = __( 'Connecting your domain to WordPress.com was cancelled' );
			contentMessage = sprintf(
				/* translators: %s: the domain name that is being connected (ex.: example.com) */
				__(
					'You might want to start over or use one of the alternative methods to connect %s to WordPress.com.'
				),
				domainName
			);
		} else {
			heading = __( 'There was a problem connecting your domain' );
			contentMessage = sprintf(
				/* translators: %s: the domain name that is being connected (ex.: example.com) */
				__(
					'We got an error when trying to connect %s to WordPress.com. You might try again or get in contact with your DNS provider to figure out what went wrong.'
				),
				domainName
			);
		}

		return (
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Heading level={ 2 } size={ 20 } weight={ 500 }>
							{ heading }
						</Heading>
						<Text as="p">{ contentMessage }</Text>
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
