/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSites, isRequestingSite, hasAllSitesList } from 'state/sites/selectors';
import { requestSites, requestSite } from 'state/sites/actions';
import { getPreference } from 'state/preferences/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';

const getRecentSites = state => getPreference( state, 'recentSites' );

const requestAll = () => ( dispatch, getState ) => {
	if ( ! isRequestingSites( getState() ) ) {
		dispatch( requestSites() );
	}
};

const requestSingle = siteId => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSite( getState(), siteId ) ) {
		dispatch( requestSite( siteId ) );
	}
};

const requestPrimary = siteId => ( dispatch, getState ) => {
	if ( siteId && ! hasAllSitesList( getState() ) && ! isRequestingSite( getState(), siteId ) ) {
		dispatch( requestSite( siteId ) );
	}
};

const requestRecent = siteIds => ( dispatch, getState ) => {
	if ( siteIds.length && ! hasAllSitesList( getState() ) ) {
		const isRequestingSomeSite = siteIds.some( siteId => isRequestingSite( getState(), siteId ) );

		if ( ! isRequestingSomeSite ) {
			siteIds.forEach( siteId => dispatch( requestSite( siteId ) ) );
		}
	}
};

export default function QuerySites( { siteId, allSites = false, primaryAndRecent = false } ) {
	const primarySiteId = useSelector( getPrimarySiteId );
	// This should return the same reference every time, so we can compare by reference.
	const recentSiteIds = useSelector( getRecentSites );

	const dispatch = useDispatch();

	useEffect( () => {
		if ( allSites ) {
			dispatch( requestAll() );
		}
		// We only want this to run on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch ] );

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestSingle( siteId ) );
		}
	}, [ dispatch, siteId ] );

	useEffect( () => {
		if ( primaryAndRecent ) {
			dispatch( requestPrimary( primarySiteId ) );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch, primarySiteId ] );

	useEffect( () => {
		if ( primaryAndRecent && recentSiteIds && recentSiteIds.length ) {
			dispatch(
				requestRecent( recentSiteIds.filter( recentSiteId => recentSiteId !== primarySiteId ) )
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ dispatch, recentSiteIds ] );

	return null;
}

QuerySites.propTypes = {
	allSites: PropTypes.bool,
	primaryAndRecent: PropTypes.bool,
	siteId: PropTypes.oneOfType( [
		PropTypes.number,
		// The actions and selectors we use also work with site slugs. Needed by jetpack-onboarding/main.
		PropTypes.string,
	] ),
};
