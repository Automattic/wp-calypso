import { useLocalizeUrl } from '@automattic/i18n-utils'; // eslint-disable-line no-restricted-imports
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useRef, useEffect, useState } from 'react';
import { domainAvailabilityQuery } from '../../../app/queries/domain-availability';
import Notice from '../../../components/notice';
import Progress from '../components/progress';
import type { StepComponentProps } from '../types';

export default function Login( {
	domain,
	progressStepList,
	pageSlug,
	onNextStep,
	isOwnershipVerificationFlow,
}: StepComponentProps ) {
	const showProgress = Object.keys( progressStepList ).includes( pageSlug );
	const [ isConnectSupported, setIsConnectSupported ] = useState( true );
	const [ rootDomainProvider, setRootDomainProvider ] = useState( 'unknown' );
	const initialValidation = useRef( false );

	const {
		data: availability,
		isLoading,
		error,
	} = useQuery( {
		...domainAvailabilityQuery( domain ),
		enabled: !! isOwnershipVerificationFlow && ! initialValidation.current,
	} );

	useEffect( () => {
		if ( ! isOwnershipVerificationFlow || initialValidation.current || ! availability ) {
			return;
		}

		if ( 'mappable' !== availability.mappable ) {
			setIsConnectSupported( false );
		}
		setRootDomainProvider( availability.root_domain_provider );
		initialValidation.current = true;
	}, [ availability, isOwnershipVerificationFlow ] );

	useEffect( () => {
		if ( error ) {
			setIsConnectSupported( false );
		}
	}, [ error ] );
	const localizeUrl = useLocalizeUrl();

	const supportUrl = localizeUrl( 'https://wordpress.com/support/domains/connect-subdomain' );

	return (
		<VStack spacing={ 6 }>
			{ showProgress && <Progress steps={ progressStepList } currentStep={ pageSlug } /> }

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ isOwnershipVerificationFlow && (
							<p>{ __( 'We need to confirm that you are authorized to connect this domain.' ) }</p>
						) }

						{ ! isLoading && ! isConnectSupported && (
							<Notice variant="error">{ __( 'This domain cannot be connected.' ) }</Notice>
						) }

						{ ! isLoading && (
							<>
								{ rootDomainProvider === 'wpcom' && (
									<p>
										{ createInterpolateElement(
											__(
												"Open a new browser tab, switch to the site the domain is added to and go to <em>Upgrades → Domains</em>. Then click on the domain name to access the domain's settings page (alternatively click on the 3 vertical dots on the domain row and select <em>View Settings</em>).<br/><br/> If the domain is under another WordPress.com account, use a different browser, log in to that account and follow the previous instructions. <a>More info can be found here</a>."
											),
											{
												br: createElement( 'br' ),
												em: createElement( 'em' ),
												a: createElement( 'a', { href: supportUrl, target: '_blank' } ),
											}
										) }
									</p>
								) }
								{ rootDomainProvider !== 'wpcom' && (
									<>
										<p>
											{ createInterpolateElement(
												__(
													"Log into your domain provider account (like GoDaddy, NameCheap, 1&1, etc.). If you can't remember who this is: go to <a>this link</a>, enter your domain and look at <em>Reseller Information</em> or <em>Registrar</em> to see the name of your provider."
												),
												{
													em: createElement( 'em' ),
													a: createElement( 'a', {
														href: 'https://wordpress.com/site-profiler',
														target: '_blank',
													} ),
												}
											) }
										</p>
										<p>
											{ sprintf(
												/* translators: %s: the domain name that the user is connecting to WordPress.com (ex.: example.com) */
												__(
													"On your domain provider's site go to the domains page. Find %s and go to its settings page."
												),
												domain
											) }
										</p>
									</>
								) }
							</>
						) }

						<HStack justify="flex-start">
							<Button
								variant="primary"
								onClick={ onNextStep }
								isBusy={ isLoading }
								disabled={ isLoading || ! isConnectSupported }
							>
								{ __( "I found the domain's settings page" ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
