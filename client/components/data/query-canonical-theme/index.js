/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryTheme from 'components/data/query-theme';
import { isWpcomTheme, isWporgTheme } from 'state/themes/selectors';

const QueryCanonicalTheme = ( { siteId, themeId, isWpcom, isWporg } ) => (
	<div>
		<QueryTheme themeId={ themeId } siteId="wpcom" />
    { ! isWpcom && <QueryTheme themeId={ themeId } siteId="wporg" /> }
		{ ! isWpcom && ! isWporg && siteId && <QueryTheme themeId={ themeId } siteId={ siteId } /> }
	</div>
);

QueryCanonicalTheme.propTypes = {
	siteId: PropTypes.number,
	themeId: PropTypes.string.isRequired,
  // Connected propTypes
	isWpcom: PropTypes.bool.isRequired,
	isWporg: PropTypes.bool.isRequired
};

export default connect(
	( state, { themeId } ) => ( {
		isWpcom: isWpcomTheme( state, themeId ),
		isWporg: isWporgTheme( state, themeId )
	} )
)( QueryCanonicalTheme );
