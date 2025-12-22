import {
	domainQuery,
	domainConnectionSetupInfoQuery,
	startDomainInboundTransferMutation,
	purchaseQuery,
	siteByIdQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	ExternalLink,
	TextControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainTransferSetupRoute } from '../../app/router/domains';
import { purchaseSettingsRoute } from '../../app/router/me';
import { siteDomainsRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardDivider } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { shouldShowRemoveAction } from '../domain-overview/actions.utils';
import DomainRegistrarBanner from './domain-registrar-banner';
import SetupStep from './setup-step';

export default function DomainTransferSetup() {
	const { domainName } = domainTransferSetupRoute.useParams();
	const navigate = useNavigate();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const queryClient = useQueryClient();

	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery( domainName, domain.blog_id )
	);
	const { data: purchase } = useQuery(
		purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
	);
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	const registrar = domainConnectionSetupInfo?.registrar || null;
	const registrar_url = domainConnectionSetupInfo?.registrar_url || null;
	const isReseller = !! domainConnectionSetupInfo?.reseller;

	const [ firstStepCompleted, setFirstStepCompleted ] = useState( false );
	const [ stepsExpanded, setStepsExpanded ] = useState< boolean[] >( [ true, false ] );
	const [ authorizationCode, setAuthorizationCode ] = useState( '' );
	const [ error, setError ] = useState< string | null >( null );

	const { mutate: startTransfer, isPending } = useMutation(
		startDomainInboundTransferMutation( domainName, domain.blog_id )
	);

	const buttonIsDisabled = isPending || ! firstStepCompleted || authorizationCode.length === 0;

	const steps = [
		{
			title: sprintf(
				// translators: %s is a domain name
				__( '1. Unlock %s' ),
				domainName
			),
			label: sprintf(
				// translators: %s is a domain name
				__( 'I have unlocked %s' ),
				domainName
			),
			content: (
				<Text>
					{ createInterpolateElement(
						// translators: <registrar/> is the domain's registrar, <domain/> is the domain name
						__(
							'Log in to <registrar/>, open the management page for <domain/>, and switch off the domain lock. Need help? <link>Follow our guide</link>'
						),

						{
							registrar:
								! isReseller && registrar_url ? (
									<ExternalLink href={ registrar_url }> { registrar } </ExternalLink>
								) : (
									<>{ registrar || __( 'your domain name provider' ) }</>
								),
							domain: <>{ domainName }</>,
							link: <InlineSupportLink supportContext="transfer-domain-registrar-login" />,
						}
					) }
				</Text>
			),
		},
		{
			title: __( '2. Enter authorization code' ),
			content: (
				<VStack spacing={ 6 }>
					<Text>
						{ sprintf(
							// translators: %s is a domain name
							'Once %s is unlocked, enter your unique authorization code below. It may also be called a transfer key, auth code, or EPP.',
							domainName
						) }
					</Text>

					<div style={ { width: '50%' } }>
						<TextControl
							label={ __( 'Authorization code' ) }
							value={ authorizationCode }
							onChange={ ( value ) => {
								setAuthorizationCode( value || '' );
								setError( null );
							} }
							type="password"
							autoComplete="off"
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</div>
					{ error && <Notice variant="error">{ error }</Notice> }
				</VStack>
			),
		},
	];

	// Only the first step has a checkbox
	const handleCheckboxChange = ( checked: boolean ) => {
		setFirstStepCompleted( checked );
		if ( checked ) {
			const newStepsExpanded = [ false, true ];
			setStepsExpanded( newStepsExpanded );
		}
	};

	const handleStepToggle = ( index: number, expanded: boolean ) => {
		setStepsExpanded( ( prev ) => {
			const newState = [ ...prev ];
			newState[ index ] = expanded;
			return newState;
		} );
	};

	const handleStartTransferClick = () => {
		setError( null );
		startTransfer( authorizationCode, {
			onSuccess: () => {
				queryClient.invalidateQueries( domainQuery( domainName ) );
				createSuccessNotice(
					sprintf(
						// translators: %s is a domain name
						__( 'Domain transfer for %s has started successfully.' ),
						domainName
					),
					{ type: 'snackbar' }
				);
				if ( site?.slug ) {
					navigate( {
						to: siteDomainsRoute.fullPath,
						params: {
							siteSlug: site.slug,
						},
					} );
				}
			},
			onError: ( err ) => {
				const errorMessage =
					err instanceof Error
						? err.message
						: __( 'An unexpected error occurred. Please try again.' );
				setError( errorMessage );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Transfer your domain name' ) }
					description={ __( 'Start your transfer in minutes. We’ll guide you through each step.' ) }
				/>
			}
		>
			<DomainRegistrarBanner
				domainName={ domainName }
				registrar={ registrar }
				registrar_url={ registrar_url }
				isReseller={ isReseller }
			/>
			<VStack spacing={ 6 }>
				<Card>
					<CardBody>
						<VStack spacing={ 6 }>
							<Text size="medium" weight={ 500 }>
								{ sprintf(
									// translators: %s is a domain name
									__( 'Transferring %s' ),
									domainName
								) }
							</Text>
							<Text>
								{ createInterpolateElement(
									__(
										// translators: <registrar/> is the domain's registrar
										'Domain name transfers typically take 5–7 days. If you want to use it quicker, <link>connect your domain name</link> first, then initiate the transfer from <registrar/> later.'
									),
									{
										link: <InlineSupportLink supportContext="map-domain-setup-instructions" />,
										registrar: <>{ registrar || __( 'your domain name provider' ) }</>,
									}
								) }
							</Text>
						</VStack>

						<VStack spacing={ 6 }>
							<div>
								<SetupStep
									expanded={ stepsExpanded[ 0 ] }
									completed={ firstStepCompleted }
									onCheckboxChange={ ( checked ) => handleCheckboxChange( checked ) }
									onToggle={ ( expanded ) => handleStepToggle( 0, expanded ) }
									title={ steps[ 0 ].title }
									label={ steps[ 0 ].label }
								>
									{ steps[ 0 ].content }
								</SetupStep>
								<CardDivider />
								<SetupStep
									expanded={ stepsExpanded[ 1 ] }
									completed={ authorizationCode.length > 0 }
									onCheckboxChange={ () => {} } // This step doesn't have a checkbox
									onToggle={ ( expanded ) => handleStepToggle( 1, expanded ) }
									title={ steps[ 1 ].title }
								>
									{ steps[ 1 ].content }
								</SetupStep>
							</div>

							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									onClick={ handleStartTransferClick }
									isBusy={ isPending }
									disabled={ buttonIsDisabled }
								>
									{ __( 'Transfer domain' ) }
								</Button>
							</ButtonStack>

							<Text size="medium" weight={ 500 }>
								{ __( 'Need help?' ) }
							</Text>
							<VStack spacing={ 2 }>
								<InlineSupportLink supportContext="transfer-domain-registration">
									{ __( 'Domain name transfer guide' ) }
								</InlineSupportLink>
								<InlineSupportLink supportContext="general-support-options">
									{ __( 'Contact support' ) }
								</InlineSupportLink>
								{ purchase && shouldShowRemoveAction( domain, purchase ) && (
									<Link
										to={ purchaseSettingsRoute.fullPath }
										params={ { purchaseId: purchase.ID } }
									>
										{ __( 'Cancel transfer' ) }
									</Link>
								) }
							</VStack>
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}
