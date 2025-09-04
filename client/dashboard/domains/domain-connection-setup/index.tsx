import { DomainConnectionSetupMode } from '@automattic/api-core';
import { domainConnectionSetupInfoQuery, domainQuery } from '@automattic/api-queries';
import { isSubdomain } from '@automattic/domain-search';
import { useSuspenseQuery } from '@tanstack/react-query';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import {
	connectADomainDomainConnectionStepsMap,
	connectASubdomainDomainConnectionStepsMap,
	DomainConnectionStepsMap,
	StepName,
	// getStepName,
	getProgressStepList,
} from './types';

export default function DomainConnectionSetup() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { initialStep } = domainRoute.useSearch();
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery(
			domainName,
			domain.blog_id,
			`https://wordpress.com/v2/domains/${ domainName }/domain-connection-setup`
		)
	);
	const stepsDefinition: DomainConnectionStepsMap = isSubdomain( domainName )
		? connectASubdomainDomainConnectionStepsMap
		: connectADomainDomainConnectionStepsMap;

	const firstStep = isSubdomain( domainName )
		? StepName.SUBDOMAIN_SUGGESTED_START
		: StepName.SUGGESTED_START;

	const resolveStepName = (
		connectionMode: DomainConnectionSetupMode | null,
		supportsDomainConnect: boolean,
		domainName: string
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

	// const parsedShowErrors = showErrors === 'true' || showErrors === '1';
	// const parsedIsFirstVisit = isFirstVisit === 'true' || isFirstVisit === '1';

	const resolvedStepName = resolveStepName(
		domainConnectionSetupInfo.connection_mode,
		!! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting,
		domainName
	);

	const StepsComponent = stepsDefinition[ resolvedStepName ]?.component;

	if ( ! StepsComponent ) {
		return null;
	}

	return (
		<PageLayout size="small" header={ <PageHeader title="Domain Connection Setup" /> }>
			<div>domainName { domainName }</div>
			<div>connectionMode { domainConnectionSetupInfo.connection_mode }</div>
			<StepsComponent
				domainName={ domainName }
				stepName={ resolvedStepName }
				mode={ domainConnectionSetupInfo.connection_mode }
				progressStepList={ getProgressStepList(
					domainConnectionSetupInfo.connection_mode,
					stepsDefinition
				) }
				onNextStep={ () => {} }
				setPage={ () => {} }
			/>
			<div>resolvedStepName { resolvedStepName }</div>
			<div>Support link placeholder</div>
			<div>Switch setup info link placeholder</div>
		</PageLayout>
	);
}
