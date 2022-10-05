import { useEffect, useState } from 'react';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ResponseDomain } from 'calypso/lib/domains/types';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
};

const StepContent = ( { siteSlug, submit, goNext, goToStep }: StepContentProps ) => {
	// We can also pass the siteId from the parent component when we figure out the rest of the logic
	const site = useSite();

	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const [ freeDomainObject, setFreeDomainObject ] = useState< ResponseDomain >();
	const [ customDomainObject, setCustomDomainObject ] = useState< ResponseDomain >();

	useEffect( () => {
		if ( allDomains ) {
			// console.log( { allDomains } );
			// Filter for custom domains
			let customDomainObjects = allDomains.filter( ( domainObject ) => {
				if ( domainObject.domain.endsWith( '.wordpress.com' ) ) {
					setFreeDomainObject( domainObject );
				}
				return ! domainObject.domain.endsWith( '.wordpress.com' );
			} );

			// Sort by "latest" custom domain
			customDomainObjects =
				customDomainObjects &&
				customDomainObjects.sort( ( firstCustomDomainObject, secondCustomDomainObject ) => {
					const firstCustomDomainDate = new Date( firstCustomDomainObject.registration_date );
					const secondCustomDomainDate = new Date( secondCustomDomainObject.registration_date );
					if ( firstCustomDomainDate > secondCustomDomainDate ) {
						return -1;
					}
					if ( firstCustomDomainDate < secondCustomDomainDate ) {
						return 1;
					}
					return 0;
				} );

			if ( customDomainObjects && customDomainObjects.length > 0 ) {
				setCustomDomainObject( customDomainObjects[ 0 ] );
			}

			// console.log( 'sorted', customDomainObjects );
		}
	}, [ allDomains ] );

	// 'freeDomainObject' will be used for sidebar URL box
	console.log( { freeDomainObject } );
	// 'customDomainObject' will be used for site preview based on additional conditionals (ssl_status && points_to_wpcom)
	console.log( { customDomainObject } );

	return (
		<div className="launchpad__content">
			<Sidebar siteSlug={ siteSlug } submit={ submit } goNext={ goNext } goToStep={ goToStep } />
			<LaunchpadSitePreview siteSlug={ siteSlug } />
		</div>
	);
};

export default StepContent;
