import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import { isWpcomTheme } from 'calypso/state/themes/selectors';

const QueryCanonicalTheme = ( { siteId, themeId, isWpcom } ) => {
	// Always fetch the site's theme record when a siteId is provided so that
	// `getCanonicalTheme` can detect slug collisions between a WP.com catalog
	// entry and a third-party theme installed on the site with the same slug.
	return (
		<Fragment>
			<QueryTheme themeId={ themeId } siteId="wpcom" />
			{ ! isWpcom && <QueryTheme themeId={ themeId } siteId="wporg" /> }
			{ siteId && <QueryTheme themeId={ themeId } siteId={ siteId } /> }
		</Fragment>
	);
};

QueryCanonicalTheme.propTypes = {
	siteId: PropTypes.number,
	themeId: PropTypes.string.isRequired,
	// Connected propTypes
	isWpcom: PropTypes.bool.isRequired,
};

export default connect( ( state, { themeId } ) => ( {
	isWpcom: isWpcomTheme( state, themeId ),
} ) )( QueryCanonicalTheme );
