import page from '@automattic/calypso-router';
import debugModule from 'debug';
import { useEffect, useRef } from 'react';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import { useSelector } from 'calypso/state';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isRequestingSiteFeatures from 'calypso/state/selectors/is-requesting-site-features';
import { getLandingPath, isSiteEligibleForJetpackCloud } from './selectors';
import type React from 'react';

const debug = debugModule( 'calypso:jetpack-cloud:landing:main' );

/**
 * Check whether or not we've asked for and received an API response
 * describing the features of the site with the given ID.
 * @param siteId The site for which features data should be requested.
 * @returns true if a request and response have taken place (success or failure);
 * false otherwise.
 */
const useResolvedSiteFeatures = ( siteId: number ) => {
	const hasSiteFeatures = useSelector(
		( state ) => !! getFeaturesBySiteId( state, siteId )?.active
	);
	const requestedSiteFeatures = useRef( false );
	const isFetchingSiteFeatures = useSelector( ( state ) =>
		isRequestingSiteFeatures( state, siteId )
	);
	useEffect( () => {
		if ( isFetchingSiteFeatures ) {
			requestedSiteFeatures.current = true;
		}
	}, [ isFetchingSiteFeatures ] );

	// If the site's features array is populated,
	// we know a request happened at some point previously and was successful
	if ( hasSiteFeatures ) {
		return true;
	}

	// If the site's features array is unpopulated, but we know we sent a request for it,
	// something must have failed; but we know an attempt was made and allowed to
	// fully resolve.
	if ( requestedSiteFeatures.current && ! isFetchingSiteFeatures ) {
		debug( 'site features request seems to have failed' );
		return true;
	}

	return false;
};

// This page should only ever load in a context where a site is already selected
const Landing: React.FC< { siteId: number } > = ( { siteId } ) => {
	const isEligible = useSelector( ( state ) => isSiteEligibleForJetpackCloud( state, siteId ) );
	const resolvedSiteFeatures = useResolvedSiteFeatures( siteId );
	const landingPath = useSelector( ( state ) => getLandingPath( state, siteId ) );

	useEffect( () => {
		// Send sites that aren't Cloud-eligible back to the home page
		if ( ! isEligible ) {
			debug( 'site not eligible; redirecting to site selection' );

			page.redirect( '/landing' );
			return;
		}

		// Before continuing, wait until we've fetched the selected site's features
		if ( ! resolvedSiteFeatures ) {
			debug( 'site features not yet resolved' );
			return;
		}

		debug( 'site features resolved; redirecting to appropriate landing page', { landingPath } );

		// By this point, we can assume that landingPath is defined;
		// let's redirect people to the most appropriate page,
		// based on the features available to the selected site
		page.redirect( landingPath );
	}, [ resolvedSiteFeatures, isEligible, landingPath ] );

	return <QuerySiteFeatures siteIds={ [ siteId ] } />;
};

export default Landing;
