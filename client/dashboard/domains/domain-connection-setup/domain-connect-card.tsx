import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';

interface DomainConnectCardProps {
	onChangeSetupMode: () => void;
	error?: string | null;
	errorDescription?: string | null;
	onVerifyConnection: () => void;
	isUpdatingConnectionMode: boolean;
}

export default function DomainConnectCard( {
	onChangeSetupMode,
	onVerifyConnection,
	isUpdatingConnectionMode,
	error,
	errorDescription,
}: DomainConnectCardProps ) {
	const renderErrorMessage = () => {
		const noticeText =
			error === 'access_denied' && errorDescription?.startsWith( 'user_cancel' )
				? __( 'Connecting your domain to WordPress.com was cancelled' )
				: __( 'There was a problem connecting your domain' );

		return (
			<>
				<Notice variant="error">{ noticeText }</Notice>
				<Text size="medium" weight={ 500 }>
					{ __( 'Something went wrong' ) }
				</Text>
				<Text>
					{ createInterpolateElement(
						__(
							'There was a problem completing your Domain Connect setup. You can retry the setup process, or use our <link>manual setup</link> option instead.'
						),
						{
							link: <Button variant="link" onClick={ onChangeSetupMode } />,
						}
					) }
				</Text>
			</>
		);
	};

	const renderDefaultContent = () => {
		return (
			<>
				<Notice variant="info">
					{ __(
						'Most updates happen quickly, but some providers cache old settings for up to 72 hours.'
					) }
				</Notice>
				<Text size="medium" weight={ 500 }>
					{ __( 'Domain Connect available' ) }
				</Text>
				<Text>
					{ createInterpolateElement(
						__(
							'Your domain name provider supports a quick and easy connection to WordPress.com. Select <b>Start setup</b> below, sign in to your registrar platform when prompted, and we’ll handle the rest.'
						),
						{
							b: <b />,
						}
					) }
				</Text>
			</>
		);
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					{ error && renderErrorMessage() }
					{ ! error && renderDefaultContent() }
					<ButtonStack justify="flex-start">
						<Button
							variant="primary"
							isBusy={ isUpdatingConnectionMode }
							disabled={ isUpdatingConnectionMode }
							onClick={ onVerifyConnection }
						>
							{ __( 'Start setup' ) }
						</Button>
					</ButtonStack>
					<Text size="medium" weight={ 500 }>
						{ __( 'Need help?' ) }
					</Text>
					<VStack spacing={ 2 }>
						<InlineSupportLink supportContext="map-domain-setup-instructions">
							{ __( 'Domain connection guide' ) }
						</InlineSupportLink>
						<InlineSupportLink supportContext="general-support-options">
							{ __( 'Contact support' ) }
						</InlineSupportLink>
						<Button variant="link" onClick={ onChangeSetupMode } style={ { lineHeight: '20px' } }>
							{ __( 'Use manual setup' ) }
						</Button>
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
