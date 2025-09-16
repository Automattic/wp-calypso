import { DomainAvailabilityStatus } from '@automattic/api-core';
import { domainAvailabilityQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
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
import { useState, useEffect } from 'react';
import InlineSupportLink from '../../../components/inline-support-link';
import Notice from '../../../components/notice';
import type { StepComponentProps } from '../types';

export function Login( {
	domainName,
	onNextStep,
	isOwnershipVerificationFlow,
}: StepComponentProps ) {
	const { data: availability, isLoading: isLoadingAvailability } = useQuery( {
		...domainAvailabilityQuery( domainName ),
		enabled: isOwnershipVerificationFlow,
	} );
	const [ isConnectSupported, setIsConnectSupported ] = useState( true );
	const [ rootDomainProvider, setRootDomainProvider ] = useState( 'unknown' );

	useEffect( () => {
		if ( ! isLoadingAvailability && availability ) {
			setIsConnectSupported( availability.mappable === DomainAvailabilityStatus.MAPPABLE );
			setRootDomainProvider( availability.root_domain_provider );
		}
	}, [ isLoadingAvailability, availability ] );

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ isOwnershipVerificationFlow && (
							<Text as="p" lineHeight="20px">
								{ __( 'We need to confirm that you are authorized to connect this domain.' ) }
							</Text>
						) }
						{ ! isLoadingAvailability && ! isConnectSupported && (
							<Notice variant="error">{ __( 'This domain cannot be connected.' ) }</Notice>
						) }
						{ ! isLoadingAvailability && (
							<>
								{ rootDomainProvider === 'wpcom' && (
									<Text as="p" lineHeight="20px">
										{ createInterpolateElement(
											__(
												'Open a new browser tab and go to the domain’s settings page. If the domain is under another WordPress.com account, use a different browser, log in to that account and follow the previous instructions. <a>More info can be found here</a>.'
											),
											{
												em: <em />,
												a: <InlineSupportLink supportContext="connect-subdomain" />,
											}
										) }
									</Text>
								) }
								{ rootDomainProvider !== 'wpcom' && (
									<>
										<Text as="p" lineHeight="20px">
											{ createInterpolateElement(
												__(
													'Log into your domain provider account (like GoDaddy, NameCheap, 1&1, etc.). If you can’t remember who this is: go to <a>this link</a>, enter your domain and look at <em>Reseller Information</em> or <em>Registrar</em> to see the name of your provider.'
												),
												{
													em: <em />,
													a: (
														<ExternalLink
															href="https://wordpress.com/site-profiler"
															children={ null }
														/>
													),
												}
											) }
										</Text>
										<Text as="p" lineHeight="20px">
											{ sprintf(
												/* translators: %s: the domain name that the user is connecting to WordPress.com (ex.: example.com) */
												__(
													'On your domain provider’s site go to the domains page. Find %s and go to its settings page.'
												),
												domainName
											) }
										</Text>
									</>
								) }
							</>
						) }
						<HStack justify="flex-start">
							<Button __next40pxDefaultSize variant="primary" onClick={ onNextStep }>
								{ __( 'I found the domain’s settings page' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
