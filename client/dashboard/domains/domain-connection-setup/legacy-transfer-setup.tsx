import { domainInboundTransferStatusQuery, domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useState } from 'react';
import { domainTransferSetupRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import Progress from './components/progress';
import {
	transferLockedDomainStepsDefinition,
	transferUnlockedDomainStepsDefinition,
} from './steps-map';
import { DomainTransferStepsMap, StepName, type StepNameValue } from './types';
import { getProgressStepList } from './utils';

export default function DomainTransferSetup() {
	const { domainName } = domainTransferSetupRoute.useParams();

	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	const { data: inboundTransferStatusInfo } = useSuspenseQuery(
		domainInboundTransferStatusQuery( domainName )
	);

	const { step: initialStepName } = domainTransferSetupRoute.useSearch();

	const [ currentStepName, setCurrentStepName ] = useState< StepNameValue >( () =>
		initialStepName ? ( initialStepName as StepNameValue ) : StepName.TRANSFER_START
	);

	const [ stepsDefinition ] = useState< DomainTransferStepsMap >( () =>
		inboundTransferStatusInfo.unlocked === true
			? transferUnlockedDomainStepsDefinition
			: transferLockedDomainStepsDefinition
	);

	const currentStep = stepsDefinition[ currentStepName as StepNameValue ];
	if ( ! currentStep ) {
		return null;
	}

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
		<PageLayout size="small" header={ <PageHeader title={ __( 'Domain name transfer setup' ) } /> }>
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
					inboundTransferStatusInfo={ inboundTransferStatusInfo }
					siteId={ domain.blog_id }
				/>
			</VStack>
		</PageLayout>
	);
}
