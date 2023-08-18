import page from 'page';
import { useEffect, useState } from 'react';
import { getSiteSlugFromDomain } from 'calypso/lib/domains/get-site-slug-domain';
import { domainManagementAllRoot, domainManagementEdit } from '../paths';

const RedirectComponent = ( { domainName }: { domainName: string } ) => {
	const [ siteSlug, setSiteSlug ] = useState< null | string >( null );
	const [ isDomainLoaded, setIsDomainLoaded ] = useState( false );

	useEffect( () => {
		getSiteSlugFromDomain(
			domainName,
			( data ) => {
				setIsDomainLoaded( true );
				setSiteSlug( data );
			},
			() => {
				// Default: redirect to all domains management
				page.redirect( domainManagementAllRoot() );
			}
		);
	}, [ domainName ] );

	useEffect( () => {
		if ( isDomainLoaded && siteSlug ) {
			page.redirect( domainManagementEdit( siteSlug, domainName, null ) );
		}
	} );

	return null;
};

export default RedirectComponent;
