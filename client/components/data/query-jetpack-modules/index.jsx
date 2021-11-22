import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isFetchingJetpackModules( getState(), siteId ) ) {
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
