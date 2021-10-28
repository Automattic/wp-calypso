import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { isRequestingActiveTheme } from 'calypso/state/themes/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingActiveTheme( getState(), siteId ) ) {
		dispatch( requestActiveTheme( siteId ) );
	}
};

function QueryActiveTheme( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryActiveTheme.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryActiveTheme;
