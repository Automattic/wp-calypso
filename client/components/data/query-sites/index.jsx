/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSites, isRequestingSite, hasAllSitesList } from 'state/sites/selectors';
import { requestSites, requestSite } from 'state/sites/actions';
import { getPreference } from 'state/preferences/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';

const getRecentSites = ( state ) => getPreference( state, 'recentSites' );

const requestAll = () => ( dispatch, getState ) => {
	if ( ! isRequestingSites( getState() ) ) {
		dispatch( requestSites() );
	}
};

function QueryAll() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestAll() );
	}, [ dispatch ] );

	return null;
}

const requestSingle = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSite( getState(), siteId ) ) {
		dispatch( requestSite( siteId ) );
	}
};

function QuerySingle( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestSingle( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

const requestPrimaryAndRecent = ( siteIds ) => ( dispatch, getState ) => {
	const state = getState();
	if ( hasAllSitesList( state ) ) {
		return;
	}

	siteIds.forEach( ( siteId ) => dispatch( requestSingle( siteId ) ) );
};

function QueryPrimaryAndRecent() {
	const primarySiteId = useSelector( getPrimarySiteId );
	// This should return the same reference every time, so we can compare by reference.
	const recentSiteIds = useSelector( getRecentSites );
	const dispatch = useDispatch();

	useEffect( () => {
		const siteIds = [ ...( primarySiteId ? [ primarySiteId ] : [] ), ...( recentSiteIds ?? [] ) ];

		if ( siteIds && siteIds.length ) {
			dispatch( requestPrimaryAndRecent( siteIds ) );
		}
	}, [ dispatch, primarySiteId, recentSiteIds ] );

	return null;
}

export default function QuerySites( { siteId, allSites = false, primaryAndRecent = false } ) {
	return (
		<Fragment>
			{ allSites && <QueryAll /> }
			{ siteId && <QuerySingle siteId={ siteId } /> }
			{ primaryAndRecent && <QueryPrimaryAndRecent /> }
		</Fragment>
	);
}

QuerySites.propTypes = {
	allSites: PropTypes.bool,
	primaryAndRecent: PropTypes.bool,
	siteId: PropTypes.oneOfType( [
		PropTypes.number,
		// The actions and selectors we use also work with site slugs.
		PropTypes.string,
	] ),
};
