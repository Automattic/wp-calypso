import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ResponseDomain } from 'calypso/lib/domains/types';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import EmailValidationBanner from './email-validation-banner';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';

type StepContentProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
	flow: string | null;
};

function sortByRegistrationDate( domainObjectA: ResponseDomain, domainObjectB: ResponseDomain ) {
	return domainObjectA.registrationDate > domainObjectB.registrationDate ? -1 : 1;
}

const StepContent = ( { siteSlug, submit, goNext, goToStep, flow }: StepContentProps ) => {
	const site = useSite();

	const { data: allDomains = [] } = useGetDomainsQuery( site?.ID ?? null, {
		retry: false,
	} );

	const domains = allDomains.map( createSiteDomainObject );

	// Filter custom domains and sort by registration date.
	// We want the first domain object to be the most recently registered domain
	const nonWpcomDomains = domains
		.filter( ( domain ) => ! domain.isWPCOMDomain )
		.sort( sortByRegistrationDate );

	const wpcomDomains = domains.filter( ( domain ) => domain.isWPCOMDomain );

	const sidebarDomain = nonWpcomDomains?.length ? nonWpcomDomains[ 0 ] : wpcomDomains[ 0 ];

	const iFrameURL = wpcomDomains.length ? wpcomDomains[ 0 ]?.domain : nonWpcomDomains[ 0 ]?.domain;

	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const email = useSelector( getCurrentUserEmail );
	const [ showEmailValidationBanner, setShowEmailValidationBanner ] = useState( false );

	useEffect( () => {
		// check if the current user's email hasn't been verified yet
		if ( email && ! isEmailVerified ) {
			setShowEmailValidationBanner( true );
		}
	}, [ email, isEmailVerified ] );

	return (
		<div className="launchpad__container">
			{ showEmailValidationBanner && (
				<EmailValidationBanner
					email={ email }
					closeBanner={ () => setShowEmailValidationBanner( false ) }
				/>
			) }
			<div className="launchpad__content">
				<Sidebar
					sidebarDomain={ sidebarDomain }
					siteSlug={ siteSlug }
					submit={ submit }
					goNext={ goNext }
					goToStep={ goToStep }
					flow={ flow }
				/>
				<LaunchpadSitePreview flow={ flow } siteSlug={ iFrameURL } />
			</div>
		</div>
	);
};

export default StepContent;
