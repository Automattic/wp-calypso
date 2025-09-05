import { useLocalizeUrl } from '@automattic/i18n-utils';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
	ExternalLink,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { type DomainConnectionStepComponentProps } from '../types';

export default function StepLogin( {
	domainName,
	onNextStep,
}: DomainConnectionStepComponentProps ) {
	// TO DO: Fetch domain availibility
	const localizeUrl = useLocalizeUrl();
	const supportUrl = localizeUrl( 'https://wordpress.com/support/domains/connect-subdomain' );
	// const rootDomainProvider = 'wpcom';
	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'Log into your domain provider account (like GoDaddy, NameCheap, 1&1, etc.). If you can’t remember who this is: go to <a>this link</a>, enter your domain and look at <em>Reseller Information</em> or <em>Registrar</em> to see the name of your provider.'
								),
								{
									br: <br />,
									em: <em />,
									a: <ExternalLink href={ supportUrl } children={ null } />,
								}
							) }
						</Text>
						<Text as="p">
							{ sprintf(
								/* translators: %s: the domain name that the user is connecting to WordPress.com (ex.: example.com) */
								__(
									'On your domain provider’s site go to the domains page. Find %s and go to its settings page.'
								),
								domainName
							) }
						</Text>
						<HStack justify="flex-start">
							<Button variant="primary" onClick={ onNextStep }>
								{ __( "I found the domain's settings page" ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
