import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import { isWpcomTheme, isWporgTheme } from 'calypso/state/themes/selectors';

const QueryCanonicalTheme = ( { siteId, themeId, isWpcom, isWporg } ) => {
	// Fetch the site's theme record once it can either resolve a collision with
	// a WP.com catalog entry or serve as the fallback after WP.com/WP.org miss.
	return (
		<Fragment>
			<QueryTheme themeId={ themeId } siteId="wpcom" />
			{ ! isWpcom && <QueryTheme themeId={ themeId } siteId="wporg" /> }
			{ siteId && ( isWpcom || ! isWporg ) && <QueryTheme themeId={ themeId } siteId={ siteId } /> }
		</Fragment>
	);
};

QueryCanonicalTheme.propTypes = {
	siteId: PropTypes.number,
	themeId: PropTypes.string.isRequired,
	// Connected propTypes
	isWpcom: PropTypes.bool.isRequired,
	isWporg: PropTypes.bool.isRequired,
};

export default connect( ( state, { themeId } ) => ( {
	isWpcom: isWpcomTheme( state, themeId ),
	isWporg: isWporgTheme( state, themeId ),
} ) )( QueryCanonicalTheme );
