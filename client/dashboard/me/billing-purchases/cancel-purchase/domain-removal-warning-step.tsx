import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	Button,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { ButtonStack } from '../../../components/button-stack';
import RouterLinkButton from '../../../components/router-link-button';
import { Text } from '../../../components/text';
import type { Purchase } from '@automattic/api-core';

import './style.scss';

interface DomainRemovalWarningStepProps {
	purchase: Purchase;
	onContinue: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export default function DomainRemovalWarningStep( {
	purchase,
	onContinue,
	onCancel,
	isLoading = false,
}: DomainRemovalWarningStepProps ) {
	const domainName = purchase.meta || purchase.product_name;
	const { data: domain } = useQuery( {
		...domainQuery( domainName ),
		enabled: Boolean( domainName ),
	} );

	return (
		<VStack spacing={ 8 }>
			<VStack spacing={ 3 }>
				<Heading level={ 3 }>
					{ sprintf(
						/* translators: %(domainName)s is the domain name */
						__( 'Delete %(domainName)s' ),
						{
							domainName,
						}
					) }
				</Heading>

				<Text>
					{ __(
						'Deleting a domain will make all services connected to it unreachable, including your email and website. It will also make the domain available for someone else to register.'
					) }
				</Text>

				{ domain?.is_gravatar_domain && (
					<Text>
						{ __(
							'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you cancel this domain, you will have to pay the standard price to register another domain for your Gravatar profile.'
						) }
					</Text>
				) }

				<Text>
					{ createInterpolateElement(
						/* translators: <domainName /> is the domain name */
						__(
							'If you want to use <domainName /> with another provider you can <moveLink>move it to another service</moveLink> or <transferLink>transfer it to another provider</transferLink>.'
						),
						{
							domainName: <strong>{ domainName }</strong>,
							moveLink: (
								<RouterLinkButton
									variant="link"
									to="/domains/$domainName"
									params={ { domainName } }
								/>
							),
							transferLink: (
								<RouterLinkButton
									variant="link"
									to="/domains/$domainName/transfer"
									params={ { domainName } }
								/>
							),
						}
					) }
				</Text>

				<Text>{ __( 'Do you still want to continue with deleting your domain?' ) }</Text>
			</VStack>

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ onCancel }
					disabled={ isLoading }
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ onContinue }
					disabled={ isLoading }
				>
					{ __( 'Continue' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
