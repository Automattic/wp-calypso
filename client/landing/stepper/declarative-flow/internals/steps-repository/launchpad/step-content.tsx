import { WordPressLogo } from '@automattic/components';
import { LaunchpadContainer } from '@automattic/launchpad';
import { useSelect } from '@wordpress/data';
import { useGetDomainsQuery } from 'calypso/data/domains/use-get-domains-query';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { createSiteDomainObject } from 'calypso/state/sites/domains/assembler';
import LaunchpadSitePreview from './launchpad-site-preview';
import Sidebar from './sidebar';
import { getLaunchpadTranslations } from './translations';
import type { SiteSelect } from '@automattic/data-stores';

type StepContentProps = {
	launchpadKey: string;
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
	flow: string;
};

function sortByRegistrationDate( domainObjectA: ResponseDomain, domainObjectB: ResponseDomain ) {
	return domainObjectA.registrationDate > domainObjectB.registrationDate ? -1 : 1;
}

const StepContent = ( {
	launchpadKey,
	siteSlug,
	submit,
	goNext,
	goToStep,
	flow,
}: StepContentProps ) => {
	const { flowName } = getLaunchpadTranslations( flow );
	const site = useSite();
	const adminUrl = useSelect(
		( select ) =>
			site && ( select( SITE_STORE ) as SiteSelect ).getSiteOption( site.ID, 'admin_url' ),
		[ site ]
	);
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

	// The adminUrl points to the .wordpress.com domain for this site, so we'll use this for the preview.
	const iFrameURL = adminUrl ? new URL( adminUrl as string ).host : null;

	const header = (
		<>
			<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
			<span className="launchpad__sidebar-header-flow-name">{ flowName }</span>
		</>
	);

	const sidebar = (
		<Sidebar
			sidebarDomain={ sidebarDomain }
			launchpadKey={ launchpadKey }
			siteSlug={ siteSlug }
			submit={ submit }
			goNext={ goNext }
			goToStep={ goToStep }
			flow={ flow }
		/>
	);

	return (
		<LaunchpadContainer
			headerClassName="launchpad__sidebar-header"
			contentClassName="launchpad__content"
			sidebarClassName="launchpad__sidebar"
			mainContentClassName="launchpad__main-content"
			header={ header }
			sidebar={ sidebar }
		>
			<LaunchpadSitePreview flow={ flow } siteSlug={ iFrameURL } />
		</LaunchpadContainer>
	);
};

export default StepContent;
