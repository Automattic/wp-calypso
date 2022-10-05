import { useEffect, useState } from 'react';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
};

const StepContent = ( { siteSlug, submit, goNext, goToStep }: StepContentProps ) => {
	const site = useSite();

	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const [ freeDomain, setFreeDomain ] = useState< string | null >( null );

	useEffect( () => {
		if ( allDomains ) {
			allDomains.forEach( ( domainObject ) => {
				// find the free .wordpress.com domain which will always be secure (will have SSL certificate)
				if ( domainObject.domain.endsWith( '.wordpress.com' ) ) {
					setFreeDomain( domainObject.domain );
				}
			} );
		}
	}, [ allDomains ] );

	return (
		<div className="launchpad__content">
			<Sidebar siteSlug={ siteSlug } submit={ submit } goNext={ goNext } goToStep={ goToStep } />
			<LaunchpadSitePreview siteSlug={ freeDomain } />
		</div>
	);
};

export default StepContent;
