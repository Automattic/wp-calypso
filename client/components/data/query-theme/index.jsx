import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestTheme } from 'calypso/state/themes/actions';
import { isRequestingTheme } from 'calypso/state/themes/selectors';

const request = ( siteId, themeId ) => ( dispatch, getState ) => {
	if ( ! isRequestingTheme( getState(), siteId, themeId ) ) {
		dispatch( requestTheme( themeId, siteId ) );
	}
};

function QueryTheme( { siteId, themeId } ) {
	useQueryTheme( siteId, themeId );
	return null;
}

export function useQueryTheme( siteId, themeId ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId && themeId ) {
			dispatch( request( siteId, themeId ) );
		}
	}, [ dispatch, siteId, themeId ] );
}

export function useQueryThemes( siteId, themeIds ) {
	const dispatch = useDispatch();

	useEffect( () => {
		themeIds.forEach( ( themeId ) => {
			if ( siteId && themeId ) {
				dispatch( request( siteId, themeId ) );
			}
		} );
	}, [ dispatch, siteId, themeIds ] );
}

QueryTheme.propTypes = {
	siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] )
		.isRequired,
	themeId: PropTypes.string.isRequired,
};

export default QueryTheme;
