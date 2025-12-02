import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Icon,
	__experimentalText as Text,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, update } from '@wordpress/icons';
import { Card, CardBody } from '../../../components/card';
import { StepType, type StepComponentProps } from '../types';

export function Done( {
	stepType,
	domainName,
	queryError,
	queryErrorDescription,
}: StepComponentProps ) {
	const isConnected = stepType === StepType.CONNECTED;
	const isVerifying = stepType === StepType.VERIFYING;

	const renderQueryError = () => {
		let contentMessage;
		let heading;
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
			<>
				<Heading level={ 2 } size={ 20 } weight={ 500 } align="center">
					{ heading }
				</Heading>
				<Text as="p" align="center">
					{ contentMessage }
				</Text>
			</>
		);
	};

	const renderConnected = () => {
		return (
			<>
				<HStack spacing={ 2 } justify="center">
					<Icon icon={ check } />
					<Heading level={ 2 } size={ 20 } weight={ 500 }>
						{ __( 'Successfully connected!' ) }
					</Heading>
				</HStack>
				<Text as="p" align="center">
					{ __(
						'Your domain is now connected to WordPress.com. Your site should be accessible at your custom domain within the next few minutes.'
					) }
				</Text>
				<Text as="p" align="center">
					{ __(
						'If your site isn’t loading at your custom domain after a few hours, check that your DNS changes have been saved correctly at your domain provider.'
					) }
				</Text>
			</>
		);
	};

	const renderVerifying = () => {
		return (
			<>
				<HStack spacing={ 2 } justify="center">
					<Icon icon={ update } size={ 48 } style={ { color: '#00A32A' } } />
					<Heading level={ 2 } size={ 20 } weight={ 500 }>
						{ __( 'Verifying connection…' ) }
					</Heading>
				</HStack>
				<Text as="p" align="center">
					{ __(
						'We’re checking if your domain is properly connected to WordPress.com. This may take a few moments.'
					) }
				</Text>
				<Text as="p" align="center">
					{ __(
						'DNS changes can take up to 72 hours to fully propagate. If the verification doesn’t complete immediately, that’s normal.'
					) }
				</Text>
			</>
		);
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					{ queryError && renderQueryError() }
					{ ! queryError && isConnected && renderConnected() }
					{ ! queryError && isVerifying && renderVerifying() }
				</VStack>
			</CardBody>
		</Card>
	);
}
