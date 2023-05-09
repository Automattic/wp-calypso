import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import isRequestingJetpackSettings from 'calypso/state/selectors/is-requesting-jetpack-settings';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingJetpackSettings( getState(), siteId ) ) {
		dispatch( requestJetpackSettings( siteId ) );
	}
};

function QueryJetpackSettings( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryJetpackSettings.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryJetpackSettings;
