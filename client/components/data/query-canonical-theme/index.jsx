/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryTheme from 'calypso/components/data/query-theme';
import { isWpcomTheme, isWporgTheme } from 'calypso/state/themes/selectors';

const QueryCanonicalTheme = ( { siteId, themeId, isWpcom, isWporg } ) => (
	<Fragment>
		<QueryTheme themeId={ themeId } siteId="wpcom" />
		{ ! isWpcom && <QueryTheme themeId={ themeId } siteId="wporg" /> }
		{ ! isWpcom && ! isWporg && siteId && <QueryTheme themeId={ themeId } siteId={ siteId } /> }
	</Fragment>
);

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
