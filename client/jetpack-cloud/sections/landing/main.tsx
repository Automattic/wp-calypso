import page from '@automattic/calypso-router';
import debugModule from 'debug';
import { useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getLandingPath, isSiteEligibleForJetpackCloud } from './selectors';

const debug = debugModule( 'calypso:jetpack-cloud:landing:main' );

// This page should only ever load in a context where a site is already selected
const Landing = ( { siteId }: { siteId: number } ) => {
	const isEligible = useSelector( ( state ) => isSiteEligibleForJetpackCloud( state, siteId ) );
	const landingPath = useSelector( ( state ) => getLandingPath( state, siteId ) );

	useEffect( () => {
		// Send sites that aren't Cloud-eligible back to the home page
		if ( ! isEligible ) {
			debug( 'site not eligible; redirecting to site selection' );

			page.redirect( '/landing' );
			return;
		}

		debug( 'site features resolved; redirecting to appropriate landing page', { landingPath } );

		// By this point, we can assume that landingPath is defined;
		// let's redirect people to the most appropriate page,
		// based on the features available to the selected site
		page.redirect( landingPath );
	}, [ isEligible, landingPath ] );

	return null;
};

export default Landing;
