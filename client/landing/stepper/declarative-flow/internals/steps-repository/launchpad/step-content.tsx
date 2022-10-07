import { useEffect, useState } from 'react';
import { useGetDomainsQuery, Domain } from 'calypso/data/domains/use-get-domains-query';
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

enum UseFor {
	IFrameDomain,
	PreviewDomain,
}

function findBestDomain( domains: Domain[], useFor: UseFor ) {
	const mostRecentlyRegisteredDomain: {
		domain: string | null;
		timestamp: number | null;
	} = {
		domain: null,
		timestamp: null,
	};

	for ( let i = 0; i < domains.length; i++ ) {
		const currentDomainObject = domains[ i ];

		if ( useFor === UseFor.IFrameDomain ) {
			// if trying to find the best domain for the iFrame (find the .wordpress.com domain if it exists)
			if ( currentDomainObject.domain.endsWith( '.wordpress.com' ) ) {
				return currentDomainObject.domain;
			}
		}

		// continue with finding the most recently registered domain
		const currentDomainRegisteredTimestamp = new Date(
			currentDomainObject.registration_date
		).getTime();

		if ( currentDomainRegisteredTimestamp > ( mostRecentlyRegisteredDomain.timestamp as number ) ) {
			mostRecentlyRegisteredDomain.domain = currentDomainObject.domain;
			mostRecentlyRegisteredDomain.timestamp = currentDomainRegisteredTimestamp;
		}
	}

	return mostRecentlyRegisteredDomain.domain;
}

const StepContent = ( { submit, goNext, goToStep }: StepContentProps ) => {
	const site = useSite();

	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const [ iFrameDomain, setIFrameDomain ] = useState< string | null >( null );
	const [ previewDomain, setPreviewDomain ] = useState< string | null >( null );

	useEffect( () => {
		if ( allDomains.length ) {
			if ( ! iFrameDomain ) {
				setIFrameDomain( findBestDomain( allDomains, UseFor.IFrameDomain ) );
			}

			if ( ! previewDomain ) {
				setPreviewDomain( findBestDomain( allDomains, UseFor.PreviewDomain ) );
			}
		}
	}, [ allDomains, iFrameDomain, previewDomain ] );

	return (
		<div className="launchpad__content">
			<Sidebar
				siteSlug={ previewDomain }
				submit={ submit }
				goNext={ goNext }
				goToStep={ goToStep }
			/>
			<LaunchpadSitePreview siteSlug={ iFrameDomain } />
		</div>
	);
};

export default StepContent;
