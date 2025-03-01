import { JobStatus, PartialDomainData } from '@automattic/data-stores';
import { PrimaryDomainLabel } from '@automattic/domains-table';
import { useTranslate } from 'i18n-calypso';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	selectedFeature?: string;
	completedJobs: JobStatus[];
}

const hasFailedJobs = ( domain: PartialDomainData, completedJobs: JobStatus[] ) => {
	return completedJobs.filter( ( job ) => job.failed.includes( domain.domain ) ).length > 0;
};

const DomainField = ( { domain: partialDomain, isAllSitesView, completedJobs }: Props ) => {
	const translate = useTranslate();
	const { getFullDomain } = useDomainsDataViewsContext();
	const domain = getFullDomain( partialDomain );
	const showPrimaryDomainLabel = ! isAllSitesView && domain && domain.isPrimary;
	const hasFailedLabel = hasFailedJobs( partialDomain, completedJobs );

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
