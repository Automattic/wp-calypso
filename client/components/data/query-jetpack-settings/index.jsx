import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import isRequestingJetpackSettings from 'calypso/state/selectors/is-requesting-jetpack-settings';

const request = ( siteId, query ) => ( dispatch, getState ) => {
	if ( ! isRequestingJetpackSettings( getState(), siteId ) ) {
		dispatch( requestJetpackSettings( siteId, query ) );
	}
};

function QueryJetpackSettings( { siteId, query } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId, query ) );
	}, [ dispatch, siteId, query ] );

	return null;
}

QueryJetpackSettings.propTypes = {
	siteId: PropTypes.number.isRequired,
	query: PropTypes.object,
};

export default QueryJetpackSettings;
