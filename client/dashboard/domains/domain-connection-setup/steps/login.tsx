import { DomainAvailabilityStatus } from '@automattic/api-core';
import { domainAvailabilityQuery } from '@automattic/api-queries';
import { useLocalizeUrl } from '@automattic/i18n-utils';
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
import { useState } from 'react';
import Notice from '../../../components/notice';
import type { StepComponentProps } from '../types';

export function Login( {
	domainName,
	onNextStep,
	isOwnershipVerificationFlow,
}: StepComponentProps ) {
	// Fetch domain availibility
	const { data: availability, isLoading: isLoadingAvailability } = useQuery(
		domainAvailabilityQuery( domainName, isOwnershipVerificationFlow )
	);
	const [ isConnectSupported, setIsConnectSupported ] = useState( true );
	const [ rootDomainProvider, setRootDomainProvider ] = useState( 'unknown' );

	if ( isOwnershipVerificationFlow && ! isLoadingAvailability && availability ) {
		setIsConnectSupported( availability.mappable === DomainAvailabilityStatus.MAPPABLE );
		setRootDomainProvider( availability.root_domain_provider );
	}

	const localizeUrl = useLocalizeUrl();
	const supportUrl = localizeUrl( 'https://wordpress.com/support/domains/connect-subdomain' );
	// const rootDomainProvider = 'wpcom';
	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ isOwnershipVerificationFlow && (
							<Text as="p">
								{ __( 'We need to confirm that you are authorized to connect this domain.' ) }
							</Text>
						) }
						{ ! isLoadingAvailability && ! isConnectSupported && (
							<Notice variant="error">{ __( 'This domain cannot be connected.' ) }</Notice>
						) }
						{ ! isLoadingAvailability && (
							<>
								{ rootDomainProvider === 'wpcom' && (
									<Text as="p">
										{ createInterpolateElement(
											__(
												'Open a new browser tab, switch to the site the domain is added to and go to <em>Upgrades → Domains</em>. Then click on the domain name to access the domain’s settings page (alternatively click on the 3 vertical dots on the domain row and select <em>View Settings</em>).<br/><br/> If the domain is under another WordPress.com account, use a different browser, log in to that account and follow the previous instructions. <a>More info can be found here</a>.'
											),
											{
												br: <br />,
												em: <em />,
												a: <ExternalLink href={ supportUrl } children={ null } />,
											}
										) }
									</Text>
								) }
								{ rootDomainProvider !== 'wpcom' && (
									<>
										<Text as="p">
											{ createInterpolateElement(
												__(
													'Log into your domain provider account (like GoDaddy, NameCheap, 1&1, etc.). If you can’t remember who this is: go to <a>this link</a>, enter your domain and look at <em>Reseller Information</em> or <em>Registrar</em> to see the name of your provider.'
												),
												{
													br: <br />,
													em: <em />,
													a: (
														<ExternalLink
															href={ localizeUrl( 'https://wordpress.com/site-profiler' ) }
															children={ null }
														/>
													),
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
									</>
								) }
							</>
						) }
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
