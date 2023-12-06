import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';

const request = ( siteId, queryClient ) => ( dispatch, getState ) => {
	if ( siteId && ! isFetchingJetpackModules( getState(), siteId ) ) {
		dispatch( fetchModuleList( siteId, queryClient ) );
	}
};

function QueryJetpackModules( { siteId } ) {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	useEffect( () => {
		dispatch( request( siteId, queryClient ) );
	}, [ dispatch, siteId, queryClient ] );

	return null;
}

QueryJetpackModules.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryJetpackModules;
