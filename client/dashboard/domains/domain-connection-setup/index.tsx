import { DomainConnectionSetupMode, DomainMappingStatus } from '@automattic/api-core';
import {
	domainConnectionSetupInfoQuery,
	domainQuery,
	updateConnectionModeMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainRoute, domainConnectionSetupRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { isSubdomain } from '../../utils/domain';
import HelpMessage from './components/help-message';
import Progress from './components/progress';
import SwitchSetup from './components/switch-setup';
import {
	connectADomainDomainConnectionStepsMap,
	connectASubdomainDomainConnectionStepsMap,
} from './steps-map';
import { DomainConnectionStepsMap, StepName, type StepNameValue } from './types';
import { getProgressStepList, isMappingVerificationSuccess, resolveStepName } from './utils';

export default function DomainConnectionSetup() {
	const { domainName } = domainRoute.useParams();

	const {
		step: intialStepName,
		showErrors,
		isFirstVisit,
		error: queryError,
		error_description: queryErrorDescription,
	} = domainRoute.useSearch();

	// Load domain data
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	// Load domain connection setup info
	const router = useRouter();
	const relativePath = router.buildLocation( {
		to: domainConnectionSetupRoute.fullPath,
		params: { domainName },
	} ).href;
	const returnUrl = new URL( relativePath, window.location.origin ).href + '?step=dc_return';
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery( domainName, domain.blog_id, returnUrl )
	);
	const { createErrorNotice } = useDispatch( noticesStore );
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
	const firstStepName: StepNameValue = isSubdomain( domainName )
		? StepName.SUBDOMAIN_SUGGESTED_START
		: StepName.SUGGESTED_START;
	const [ currentStepName, setCurrentStepName ] = useState< StepNameValue >(
		resolveStepName(
			domainConnectionSetupInfo.connection_mode,
			!! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting,
			domainName,
			intialStepName as StepNameValue,
			firstStepName
		)
	);

	const stepsDefinition: DomainConnectionStepsMap = isSubdomain( domainName )
		? connectASubdomainDomainConnectionStepsMap
		: connectADomainDomainConnectionStepsMap;

	const currentStep = stepsDefinition[ currentStepName as StepNameValue ];
	if ( ! currentStep ) {
		return null;
	}

	const verifyConnection = ( setStepAfterVerify = true ): void => {
		let connectedSlug: StepNameValue =
			DomainConnectionSetupMode.SUGGESTED === currentStep.mode
				? StepName.SUGGESTED_CONNECTED
				: StepName.ADVANCED_CONNECTED;
		let verifyingSlug: StepNameValue =
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
				if ( setStepAfterVerify ) {
					setCurrentStepName( verifyingSlug );
				}
				createErrorNotice(
					__( 'We couldn’t verify the connection for your domain, please try again.' ),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	const setNextStepName = () => {
		const next = stepsDefinition[ currentStepName as StepNameValue ]?.next;
		next && setCurrentStepName( next );
	};

	const goBack = () => {
		if ( currentStep.prev ) {
			setCurrentStepName( currentStep.prev );
		}
	};

	const showProgress = Object.keys(
		getProgressStepList( currentStep.mode, stepsDefinition )
	).includes( currentStepName as string );

	const StepsComponent = currentStep.component;
	if ( StepsComponent === null ) {
		return null;
	}

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Domain connection setup' ) } /> }>
			{ currentStep.prev && (
				<HStack>
					<Button icon={ isRTL() ? chevronRight : chevronLeft } onClick={ goBack }>
						{ __( 'Back' ) }
					</Button>
				</HStack>
			) }
			{ showProgress && (
				<Progress
					steps={ getProgressStepList( currentStep.mode, stepsDefinition ) }
					currentStepName={ currentStepName }
				/>
			) }
			<VStack spacing={ 6 }>
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
				<VStack spacing={ 2 }>
					{ ( currentStep.mode === DomainConnectionSetupMode.SUGGESTED ||
						currentStep.mode === DomainConnectionSetupMode.ADVANCED ||
						currentStep.mode === DomainConnectionSetupMode.DONE ) && (
						<HelpMessage mode={ currentStep.mode } />
					) }
					<SwitchSetup
						currentStepType={ currentStep.stepType }
						currentMode={ currentStep.mode }
						supportsDomainConnect={
							!! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting
						}
						isSubdomain={ isSubdomain( domainName ) }
						setPage={ setCurrentStepName }
					/>
				</VStack>
			</VStack>
		</PageLayout>
	);
}
