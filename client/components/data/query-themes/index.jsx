import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { requestThemes } from 'calypso/state/themes/actions';
import { getThemesForQuery, isRequestingThemesForQuery } from 'calypso/state/themes/selectors';

export function useQueryThemes( siteId, query ) {
	const dispatch = useDispatch();
	const isRequesting = useSelector( ( state ) =>
		isRequestingThemesForQuery( state, siteId, query )
	);
	const hasThemes = useSelector( ( state ) => getThemesForQuery( state, siteId, query ) !== null );

	useEffect( () => {
		if ( ! isRequesting && ! hasThemes ) {
			dispatch( requestThemes( siteId, query ) );
		}
	}, [ dispatch, siteId, query, isRequesting, hasThemes ] );
}

function QueryThemes( { siteId, query } ) {
	useQueryThemes( siteId, query );
	return null;
}

QueryThemes.propTypes = {
	siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] )
		.isRequired,
	// A theme query. Note that on Jetpack sites, only the `search` argument is supported.
	query: PropTypes.shape( {
		// The search string
		search: PropTypes.string,
		// The tier to look for -- 'free', 'premium', 'marketplace', or '' (for all themes)
		tier: PropTypes.oneOf( [ '', ...Object.keys( THEME_TIERS ) ] ),
		// Comma-separated list of filters; see my-sites/themes/theme-filters
		filter: PropTypes.string,
		// Which page of the results list to display
		page: PropTypes.number,
		// How many results per page
		number: PropTypes.number,
	} ),
};

export default QueryThemes;
