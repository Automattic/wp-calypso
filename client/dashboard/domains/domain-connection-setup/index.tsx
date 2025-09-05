import { DomainConnectionSetupMode } from '@automattic/api-core';
import { domainConnectionSetupInfoQuery, domainQuery } from '@automattic/api-queries';
import { isSubdomain } from '@automattic/domain-search';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SwitchSetup from './switsh-setup';
import {
	connectADomainDomainConnectionStepsMap,
	connectASubdomainDomainConnectionStepsMap,
	DomainConnectionStepsMap,
	StepName,
} from './types';
import { getProgressStepList } from './utils';

const resolveStepName = (
	connectionMode: DomainConnectionSetupMode | null,
	supportsDomainConnect: boolean,
	domainName: string,
	initialStep: StepName,
	firstStep: StepName // default step
): StepName => {
	if ( initialStep ) {
		return initialStep as StepName;
	}
	// If connectionMode is present we'll send you to the last step of the relevant flow
	if ( connectionMode ) {
		if ( isSubdomain( domainName ) ) {
			return connectionMode === DomainConnectionSetupMode.ADVANCED
				? StepName.SUBDOMAIN_ADVANCED_UPDATE
				: StepName.SUBDOMAIN_SUGGESTED_UPDATE;
		}
		if ( connectionMode === DomainConnectionSetupMode.ADVANCED ) {
			return StepName.ADVANCED_UPDATE;
		} else if ( connectionMode === DomainConnectionSetupMode.DC ) {
			return StepName.DC_START;
		}
		return StepName.SUGGESTED_UPDATE;
	}
	// If connectionMode is not present we'll send you to one of the start steps
	if ( supportsDomainConnect ) {
		return StepName.DC_START;
	}
	return firstStep;
};

export default function DomainConnectionSetup() {
	const { domainName } = domainRoute.useParams();
	const stepsDefinition: DomainConnectionStepsMap = isSubdomain( domainName )
		? connectASubdomainDomainConnectionStepsMap
		: connectADomainDomainConnectionStepsMap;

	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { initialStep: intialStepName } = domainRoute.useSearch();
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery(
			domainName,
			domain.blog_id,
			`https://wordpress.com/v2/domains/${ domainName }/domain-connection-setup`
		)
	);

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

	const currentStep = stepsDefinition[ currentStepName ];
	if ( ! currentStep ) {
		return null;
	}

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
		getProgressStepList( domainConnectionSetupInfo.connection_mode, stepsDefinition )
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
			<VStack>
				<StepsComponent
					domainName={ domainName }
					stepName={ currentStepName }
					mode={ currentStep.mode }
					onNextStep={ setNextStepName }
					setPage={ setCurrentStepName }
				/>
				<SwitchSetup
					currentStepType={ currentStep.step }
					currentMode={ currentStep.mode }
					supportsDomainConnect={ !! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting }
					isSubdomain={ isSubdomain( domainName ) }
					setPage={ setCurrentStepName }
				/>
				{ showProgress && <>Show progress</> }
			</VStack>
		</PageLayout>
	);
}
