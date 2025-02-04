import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	const isJetpack = isJetpackSite( getState(), siteId );
	const isAtomic = isSiteWpcomAtomic( getState(), siteId );

	if ( siteId && ! isFetchingJetpackModules( getState(), siteId ) && ( isAtomic || isJetpack ) ) {
		dispatch( fetchModuleList( siteId ) );
	}
};

function QueryJetpackModules( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryJetpackModules.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryJetpackModules;
