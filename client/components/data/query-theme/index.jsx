import { useLocale } from '@automattic/i18n-utils';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { requestTheme } from 'calypso/state/themes/actions';
import { isRequestingTheme } from 'calypso/state/themes/selectors';

const request =
	( siteId, themeId, forceRequest = false ) =>
	( dispatch, getState ) => {
		if ( ! isRequestingTheme( getState(), siteId, themeId ) || forceRequest ) {
			dispatch( requestTheme( themeId, siteId ) );
		}
	};

function QueryTheme( { siteId, themeId } ) {
	useQueryTheme( siteId, themeId );
	return null;
}

export function useQueryTheme( siteId, themeId ) {
	const dispatch = useDispatch();
	const locale = useLocale();
	const oldLocale = useRef( locale );

	useEffect( () => {
		if ( siteId && themeId ) {
			if ( oldLocale.current !== locale ) {
				oldLocale.current = locale;
				dispatch( request( siteId, themeId, true ) );
			} else {
				dispatch( request( siteId, themeId ) );
			}
		}
	}, [ dispatch, siteId, themeId, locale ] );
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
