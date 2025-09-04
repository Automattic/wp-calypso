import { DomainConnectionSetupMode } from '@automattic/api-core';
import { domainConnectionSetupInfoQuery, domainQuery } from '@automattic/api-queries';
import { isSubdomain } from '@automattic/domain-search';
import { useSuspenseQuery } from '@tanstack/react-query';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { StepSlug } from './constants';
import {
	connectADomainStepsDefinition,
	connectASubdomainStepsDefinition,
	type StepsDefinition,
} from './page-definitions';

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
	const stepsDefinition: StepsDefinition = isSubdomain( domainName )
		? connectASubdomainStepsDefinition
		: connectADomainStepsDefinition;

	const firstStep = isSubdomain( domainName )
		? StepSlug.SUBDOMAIN_SUGGESTED_START
		: StepSlug.SUGGESTED_START;

	const resolveMappingSetupStep = (
		connectionMode: DomainConnectionSetupMode | null,
		supportsDomainConnect: boolean,
		domainName: string
	): StepSlug => {
		if ( initialStep ) {
			return initialStep as StepSlug;
		}
		// If connectionMode is present we'll send you to the last step of the relevant flow
		if ( connectionMode ) {
			if ( isSubdomain( domainName ) ) {
				return connectionMode === DomainConnectionSetupMode.ADVANCED
					? StepSlug.SUBDOMAIN_ADVANCED_UPDATE
					: StepSlug.SUBDOMAIN_SUGGESTED_UPDATE;
			}
			if ( connectionMode === DomainConnectionSetupMode.ADVANCED ) {
				return StepSlug.ADVANCED_UPDATE;
			} else if ( connectionMode === DomainConnectionSetupMode.DC ) {
				return StepSlug.DC_START;
			}
			return StepSlug.SUGGESTED_UPDATE;
		}
		// If connectionMode is not present we'll send you to one of the start steps
		if ( supportsDomainConnect ) {
			return StepSlug.DC_START;
		}
		return firstStep;
	};

	const resolvedPageSlug = resolveMappingSetupStep(
		domainConnectionSetupInfo.connection_mode,
		!! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting,
		domainName
	);

	const stepDefinition = stepsDefinition[ resolvedPageSlug ];
	const StepsComponent = stepDefinition?.component;

	return (
		<PageLayout size="small" header={ <PageHeader title="Domain Connection Setup" /> }>
			<div>domainName: { domainName }</div>
			<div>connectionMode: { domainConnectionSetupInfo.connection_mode }</div>
			<div>resolvedPageSlug: { resolvedPageSlug }</div>
			{ StepsComponent }
			<div>Support link placeholder</div>
			<div>Switch setup info link placeholder</div>
		</PageLayout>
	);
}
