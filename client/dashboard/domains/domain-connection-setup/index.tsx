import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useSearch, useRouter } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useRef, useCallback } from 'react';
import { isSubdomain } from '../../../lib/domains';
import {
	domainSetupInfoQuery,
	updateConnectionModeMutation,
} from '../../app/queries/domain-connection-setup';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteDomainConnectRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SwitchSetupInfoLink from './components/switch-setup-info-link';
import ConnectDomainSteps from './connect-domain-steps';
import { modeType, stepSlug, defaultDomainSetupInfo } from './constants';
import {
	connectADomainStepsDefinition,
	connectASubdomainStepsDefinition,
} from './step-definitions';
import { isMappingVerificationSuccess } from './utils';
import type { StepSlug } from './constants';
import type { VerificationStatus, DomainSetupInfo, StepsDefinition } from './types';
import type { DomainMappingSetupInfo } from '../../data/domain-connection-setup';

export default function ConnectDomain() {
	const params = useParams( { from: '/sites/$siteSlug/domain-connection-setup' } );
	const search = useSearch( { from: '/sites/$siteSlug/domain-connection-setup' } );

	const domainName = search.domainName;
	const initialStep = search.step;
	const showErrors = search[ 'show-errors' ] === 'true' || search[ 'show-errors' ] === '1';

	const queryError = search?.error;
	const queryErrorDescription = search?.error_description;

	// TODO: used to show different breadcrumbs but we don't have breadcrumbs in the HD for now
	// const isFirstVisit = search?.firstVisit === 'true' || search?.firstVisit === '1';
	const { data: site } = useQuery( siteBySlugQuery( params.siteSlug ) );

	const stepsDefinition: StepsDefinition = isSubdomain( domainName )
		? connectASubdomainStepsDefinition
		: connectADomainStepsDefinition;

	const firstStep = isSubdomain( domainName )
		? stepSlug.SUBDOMAIN_SUGGESTED_START
		: stepSlug.SUGGESTED_START;

	const [ pageSlug, setPageSlug ] = useState< StepSlug >( firstStep );
	const [ verificationStatus, setVerificationStatus ] = useState< VerificationStatus >( {} );
	const [ verificationInProgress, setVerificationInProgress ] = useState( false );
	const [ domainSetupInfo, setDomainSetupInfo ] =
		useState< DomainSetupInfo >( defaultDomainSetupInfo );

	// TODO: we need to handle errors better
	// const [ domainSetupInfoError, setDomainSetupInfoError ] = useState< Record< string, unknown > >(
	// 	{}
	// );

	const statusRef = useRef< Record< string, unknown > >( {} );

	if ( stepsDefinition[ pageSlug ] === undefined ) {
		// TODO: handle this better
	}

	const currentStep = stepsDefinition[ pageSlug ] || stepsDefinition[ firstStep ];
	// const isStepStart = stepType.START === currentStep.step; // TODO: not sure if we need this
	const mode = currentStep.mode;
	const step = currentStep.step;
	const prevPageSlug = currentStep.prev;
	// const isTwoColumnLayout = ! currentStep.singleColumnLayout; // TODO: we do show transfer recommendation in the sidebar in some cases

	const router = useRouter();
	// TODO: We need to figure out how to build this URL so that it's not hardcoded to v2
	// TODO: for testing purposes, we're using calypso.localhost:3000
	// FIX: Make sure this is wpcom before deploying
	const redirectURL =
		'http://calypso.localhost:3000' +
		router.buildLocation( {
			to: siteDomainConnectRoute.fullPath,
			params: {
				siteSlug: site?.slug,
			},
			search: {
				domainName: domainName,
				step: stepSlug.DC_RETURN,
			},
		} ).href;

	const { data: setupInfo, isLoading: loadingDomainSetupInfo } = useQuery(
		domainSetupInfoQuery( domainName, site?.ID || 0, redirectURL )
	) as { data: DomainMappingSetupInfo | undefined; isLoading: boolean };

	const getConnectedSlug = ( domain: string, mode: string ) => {
		if ( isSubdomain( domain ) ) {
			return modeType.SUGGESTED === mode
				? stepSlug.SUBDOMAIN_SUGGESTED_CONNECTED
				: stepSlug.SUBDOMAIN_ADVANCED_CONNECTED;
		}
		return modeType.SUGGESTED === mode ? stepSlug.SUGGESTED_CONNECTED : stepSlug.ADVANCED_CONNECTED;
	};

	const getVerifyingSlug = ( domain: string, mode: string ) => {
		if ( isSubdomain( domain ) ) {
			return modeType.SUGGESTED === mode
				? stepSlug.SUBDOMAIN_SUGGESTED_VERIFYING
				: stepSlug.SUBDOMAIN_ADVANCED_VERIFYING;
		}
		return modeType.SUGGESTED === mode ? stepSlug.SUGGESTED_VERIFYING : stepSlug.ADVANCED_VERIFYING;
	};

	const verifyConnectionMutation = useMutation( {
		...updateConnectionModeMutation( domainName, site?.ID || 0 ),
		onSuccess: ( data ) => {
			setVerificationStatus( {
				data: {
					status: data.status,
					errors: data.errors
						? Object.entries( data.errors ).map( ( [ code, message ] ) => ( {
								code,
								message: String( message ),
						  } ) )
						: undefined,
				},
			} );

			const connectedSlug = getConnectedSlug( domainName, mode );
			const verifyingSlug = getVerifyingSlug( domainName, mode );

			if ( isMappingVerificationSuccess( mode, data ) ) {
				setPageSlug( connectedSlug );
			} else {
				setPageSlug( verifyingSlug );
			}
		},
		onError: ( error ) => {
			setVerificationStatus( { error } );
			const verifyingSlug = getVerifyingSlug( domainName, mode );
			setPageSlug( verifyingSlug );
		},
		onSettled: () => {
			setVerificationInProgress( false );
		},
	} );

	const verifyConnection = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		( setStepAfterVerify = true ) => {
			// TODO: I'm not handling the verification properly here - see the original code
			setVerificationStatus( {} );
			setVerificationInProgress( true );
			verifyConnectionMutation.mutate( mode );
		},
		[ mode, verifyConnectionMutation ]
	);

	const resolveMappingSetupStep = useCallback(
		( connectionMode?: string, supportsDomainConnect?: boolean ) => {
			if ( initialStep ) {
				return initialStep;
			}

			if ( connectionMode ) {
				if ( isSubdomain( domainName ) ) {
					return connectionMode === modeType.ADVANCED
						? stepSlug.SUBDOMAIN_ADVANCED_UPDATE
						: stepSlug.SUBDOMAIN_SUGGESTED_UPDATE;
				}
				if ( connectionMode === modeType.ADVANCED ) {
					return stepSlug.ADVANCED_UPDATE;
				} else if ( connectionMode === modeType.DC ) {
					return stepSlug.DC_START;
				}
				return stepSlug.SUGGESTED_UPDATE;
			}

			if ( supportsDomainConnect ) {
				return stepSlug.DC_START;
			}
			return firstStep;
		},
		[ initialStep, firstStep, domainName ]
	);

	useEffect( () => {
		if ( setupInfo && ! ( statusRef.current as any )?.hasLoadedStatusInfo?.[ domainName ] ) {
			// Convert API response to expected format
			const formattedSetupInfo = {
				data: {
					default_ip_addresses: setupInfo.default_ip_addresses || [ '192.0.78.24', '192.0.78.25' ],
					wpcom_name_servers: setupInfo.wpcom_name_servers || [
						'ns1.wordpress.com',
						'ns2.wordpress.com',
						'ns3.wordpress.com',
					],
					is_subdomain: setupInfo.is_subdomain || false,
					connection_mode: setupInfo.connection_mode,
					domain_connect_apply_wpcom_hosting: setupInfo.domain_connect_apply_wpcom_hosting,
				},
			};
			setDomainSetupInfo( formattedSetupInfo );
			const resolvedPageSlug = resolveMappingSetupStep(
				setupInfo.connection_mode,
				setupInfo.domain_connect_apply_wpcom_hosting
			);
			setPageSlug( resolvedPageSlug );
			( statusRef.current as any ).hasLoadedStatusInfo = { [ domainName ]: true };
		}
	}, [ setupInfo, domainName, resolveMappingSetupStep ] );

	useEffect( () => {
		if ( showErrors && ! statusRef.current?.hasFetchedVerificationStatus ) {
			statusRef.current.hasFetchedVerificationStatus = true;
			verifyConnection( false );
		}
	}, [ showErrors, verifyConnection ] );

	const goBack = useCallback( () => {
		if ( prevPageSlug ) {
			setPageSlug( prevPageSlug );
		}
		// TODO: Implement navigation back to domains list
	}, [ prevPageSlug ] );

	if ( loadingDomainSetupInfo ) {
		return (
			<PageLayout header={ <PageHeader title={ __( 'Connect Domain' ) } /> }>
				<Card>
					<VStack spacing={ 4 }>
						<div>{ __( 'Loading domain setup information…' ) }</div>
						{ /* Placeholder bars similar to original */ }
						<div
							style={ {
								height: '20px',
								backgroundColor: '#f0f0f0',
								borderRadius: '4px',
								width: '80%',
							} }
						></div>
						<div
							style={ {
								height: '20px',
								backgroundColor: '#f0f0f0',
								borderRadius: '4px',
								width: '60%',
							} }
						></div>
						<div
							style={ {
								height: '20px',
								backgroundColor: '#f0f0f0',
								borderRadius: '4px',
								width: '70%',
							} }
						></div>
						<div
							style={ {
								height: '20px',
								backgroundColor: '#f0f0f0',
								borderRadius: '4px',
								width: '50%',
							} }
						></div>
						<div
							style={ {
								height: '20px',
								backgroundColor: '#f0f0f0',
								borderRadius: '4px',
								width: '65%',
							} }
						></div>
					</VStack>
				</Card>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ sprintf(
						// translators: %1s is the domain name
						__( 'Connect %1s' ),
						domainName
					) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				{ prevPageSlug && (
					<HStack>
						<button onClick={ goBack }>{ __( '← Back' ) }</button>
					</HStack>
				) }
				<ConnectDomainSteps
					domain={ domainName }
					initialPageSlug={ pageSlug }
					stepsDefinition={ stepsDefinition }
					onSetPage={ setPageSlug }
					onVerifyConnection={ verifyConnection }
					verificationInProgress={ verificationInProgress }
					verificationStatus={ verificationStatus }
					domainSetupInfo={ domainSetupInfo }
					// domainSetupInfoError={ domainSetupInfoError } // TODO: need to handle errors better
					showErrors={ showErrors }
					queryError={ queryError }
					queryErrorDescription={ queryErrorDescription }
				/>
				{ ! loadingDomainSetupInfo && (
					<SwitchSetupInfoLink
						currentMode={ mode }
						currentStep={ step }
						supportsDomainConnect={ !! domainSetupInfo?.data?.domain_connect_apply_wpcom_hosting }
						domainName={ domainName }
						setPage={ setPageSlug }
					/>
				) }
			</VStack>
		</PageLayout>
	);
}
