import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchInstallInstructions } from 'calypso/state/plugins/premium/actions';
import { hasRequested } from 'calypso/state/plugins/premium/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! hasRequested( getState(), siteId ) ) {
		dispatch( fetchInstallInstructions( siteId ) );
	}
};

function QueryPluginKeys( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( request( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

QueryPluginKeys.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryPluginKeys;
