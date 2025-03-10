import { JobStatus, PartialDomainData } from '@automattic/data-stores';
import { PrimaryDomainLabel } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	selectedFeature?: string;
	completedJobs: JobStatus[];
}

const hasFailedJobs = ( domain: string, completedJobs: JobStatus[] ) => {
	return completedJobs.some( ( job ) => job.failed.includes( domain ) );
};

const DomainField = ( { domain: partialDomain, isAllSitesView, completedJobs }: Props ) => {
	const translate = useTranslate();
	const { getFullDomain } = useDomainsDataViewsContext();
	const domain = getFullDomain( partialDomain );
	const showPrimaryDomainLabel = ! isAllSitesView && domain && domain.isPrimary;
	const hasFailedLabel = useMemo(
		() => hasFailedJobs( partialDomain.domain, completedJobs ),
		[ partialDomain.domain, completedJobs ]
	);

	return (
		<>
			{ showPrimaryDomainLabel && <PrimaryDomainLabel /> }
			<div className="domains-dataviews__domain-name">{ partialDomain.domain }</div>
			{ hasFailedLabel && (
				<span className="domains-dataviews__domain-failed-label">
					{ translate( 'Update failed' ) }
				</span>
			) }
		</>
	);
};

export { DomainField };
