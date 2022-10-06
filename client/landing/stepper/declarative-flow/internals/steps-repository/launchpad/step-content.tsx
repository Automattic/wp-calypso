import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
};

function sortByRegistrationDateCompareFunction(
	firstDomainObject: ResponseDomain,
	secondDomainObject: ResponseDomain
) {
	if ( firstDomainObject.registrationDate > secondDomainObject.registrationDate ) {
		return -1;
	} else if ( firstDomainObject.registrationDate < secondDomainObject.registrationDate ) {
		return 1;
	}
	return 1;
}

const StepContent = ( { siteSlug, submit, goNext, goToStep }: StepContentProps ) => {
	const site = useSite();

	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const domains = allDomains.map( createSiteDomainObject );

	// Filter custom domains and sort by registration date.
	// We want the first domain object to be the most recently registered domain
	const nonWpcomDomains = domains
		.filter( ( domain ) => ! domain.isWPCOMDomain )
		.sort( sortByRegistrationDateCompareFunction );

	const wpcomDomains = domains.filter( ( domain ) => domain.isWPCOMDomain );

	const sidebarURL =
		domains &&
		( nonWpcomDomains?.length > 0 ? nonWpcomDomains[ 0 ]?.domain : wpcomDomains[ 0 ]?.domain );

	return (
		<div className="launchpad__content">
			<Sidebar siteSlug={ sidebarURL } submit={ submit } goNext={ goNext } goToStep={ goToStep } />
			<LaunchpadSitePreview siteSlug={ siteSlug } />
		</div>
	);
};

export default StepContent;
