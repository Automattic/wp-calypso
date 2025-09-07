import { DomainConnectionSetupMode, DomainMappingStatus } from '@automattic/api-core';
import {
	domainConnectionSetupInfoQuery,
	domainQuery,
	updateConnectionModeMutation,
} from '@automattic/api-queries';
import { isSubdomain } from '@automattic/domain-search';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainRoute, domainConnectionSetupRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import Progress from './components/progress';
import SwitchSetup from './components/switch-setup';
import {
	connectADomainDomainConnectionStepsMap,
	connectASubdomainDomainConnectionStepsMap,
} from './steps-map';
import { DomainConnectionStepsMap, StepName } from './types';
import { getProgressStepList, isMappingVerificationSuccess, resolveStepName } from './utils';

export default function DomainConnectionSetup() {
	const { domainName } = domainRoute.useParams();

	const {
		initialStep: intialStepName,
		showErrors,
		isFirstVisit,
		queryError,
		queryErrorDescription,
	} = domainRoute.useSearch();

	// Load domain data
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	// Load domain connection setup info
	const router = useRouter();
	const relativePath = router.buildLocation( {
		to: domainConnectionSetupRoute.fullPath,
		params: { domainName },
	} ).href;
	const returnUrl = new URL( relativePath, window.location.origin ).href;
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery( domainName, domain.blog_id, encodeURIComponent( returnUrl ) )
	);

	// Update connection mode mutation
	const { mutate: updateConnectionMode, isPending: isUpdatingConnectionMode } = useMutation(
		updateConnectionModeMutation( domainName, domain.blog_id )
	);
	const [ verificationStatus, setVerificationStatus ] = useState< DomainMappingStatus | undefined >(
		undefined
	);

	// currentStepName is initizialized considering this sequence of priority:
	// 1. initialStepName (from query string)
	// 2. calculated step name based on api response data
	// 3. firstStepName (default first step)
	const firstStepName = isSubdomain( domainName )
		? StepName.SUBDOMAIN_SUGGESTED_START
		: StepName.SUGGESTED_START;
	const [ currentStepName, setCurrentStepName ] = useState< StepName >(
		resolveStepName(
			domainConnectionSetupInfo.connection_mode,
			!! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting,
			domainName,
			intialStepName,
			firstStepName
		)
	);

	const stepsDefinition: DomainConnectionStepsMap = isSubdomain( domainName )
		? connectASubdomainDomainConnectionStepsMap
		: connectADomainDomainConnectionStepsMap;

	const currentStep = stepsDefinition[ currentStepName ];
	if ( ! currentStep ) {
		return null;
	}

	const verifyConnection = ( setStepAfterVerify = true ): void => {
		let connectedSlug =
			DomainConnectionSetupMode.SUGGESTED === currentStep.mode
				? StepName.SUGGESTED_CONNECTED
				: StepName.ADVANCED_CONNECTED;
		let verifyingSlug =
			DomainConnectionSetupMode.SUGGESTED === currentStep.mode
				? StepName.SUGGESTED_VERIFYING
				: StepName.ADVANCED_VERIFYING;

		if ( isSubdomain( domainName ) ) {
			connectedSlug =
				DomainConnectionSetupMode.SUGGESTED === currentStep.mode
					? StepName.SUBDOMAIN_SUGGESTED_CONNECTED
					: StepName.SUBDOMAIN_ADVANCED_CONNECTED;
			verifyingSlug =
				DomainConnectionSetupMode.SUGGESTED === currentStep.mode
					? StepName.SUBDOMAIN_SUGGESTED_VERIFYING
					: StepName.SUBDOMAIN_ADVANCED_VERIFYING;
		}
		updateConnectionMode( currentStep.mode, {
			onSuccess: ( data: DomainMappingStatus ) => {
				setVerificationStatus( data );
				if ( setStepAfterVerify ) {
					if ( isMappingVerificationSuccess( currentStep.mode, data ) ) {
						setCurrentStepName( connectedSlug );
					} else {
						setCurrentStepName( verifyingSlug );
					}
				}
			},
			onError: () => {
				// TO DO: show snackbar error or pass the error to the component?
				if ( setStepAfterVerify ) {
					setCurrentStepName( verifyingSlug );
				}
			},
		} );
	};

	const setNextStepName = () => {
		const next = stepsDefinition[ currentStepName ]?.next;
		next && setCurrentStepName( next );
	};

	const goBack = () => {
		if ( currentStep.prev ) {
			setCurrentStepName( currentStep.prev );
		}
	};

	const showProgress = Object.keys(
		getProgressStepList( currentStep.mode, stepsDefinition )
	).includes( currentStepName );

	const StepsComponent = currentStep.component;

	return (
		<PageLayout size="small" header={ <PageHeader title="Domain Connection Setup" /> }>
			{ currentStep.prev && (
				<HStack>
					<Button onClick={ goBack } variant="link">
						{ __( '← Back' ) }
					</Button>
				</HStack>
			) }
			{ showProgress && (
				<Progress
					steps={ getProgressStepList( currentStep.mode, stepsDefinition ) }
					currentStepName={ currentStepName }
				/>
			) }
			<VStack>
				<StepsComponent
					domainName={ domainName }
					stepName={ currentStepName }
					stepType={ currentStep.stepType }
					mode={ currentStep.mode }
					onNextStep={ setNextStepName }
					setPage={ setCurrentStepName }
					domainSetupInfo={ domainConnectionSetupInfo }
					verificationStatus={ verificationStatus }
					onVerifyConnection={ verifyConnection }
					verificationInProgress={ isUpdatingConnectionMode }
					showErrors={ showErrors === 'true' || showErrors === '1' }
					isFirstVisit={ isFirstVisit === 'true' || isFirstVisit === '1' }
					queryError={ queryError }
					queryErrorDescription={ queryErrorDescription }
					isOwnershipVerificationFlow={ false }
				/>
				{ /* Add support link */ }
				<SwitchSetup
					currentStepType={ currentStep.stepType }
					currentMode={ currentStep.mode }
					supportsDomainConnect={ !! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting }
					isSubdomain={ isSubdomain( domainName ) }
					setPage={ setCurrentStepName }
				/>
			</VStack>
		</PageLayout>
	);
}
