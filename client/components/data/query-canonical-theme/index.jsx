import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { isWpcomTheme, isWporgTheme } from 'calypso/state/themes/selectors';

const QueryCanonicalTheme = ( { siteId, themeId, isWpcom, isWporg, isJetpack } ) => {
	// Fetch the site's theme record once it can either resolve a collision with
	// a WP.com catalog entry or serve as the fallback after WP.com/WP.org miss.
	// A collision needs an uploaded theme, so only Jetpack and Atomic sites can
	// have one. Simple sites skip that request, which they would answer with a 403.
	const shouldQuerySiteTheme = isWpcom ? isJetpack : ! isWporg;
	return (
		<Fragment>
			<QueryTheme themeId={ themeId } siteId="wpcom" />
			{ ! isWpcom && <QueryTheme themeId={ themeId } siteId="wporg" /> }
			{ siteId && shouldQuerySiteTheme && <QueryTheme themeId={ themeId } siteId={ siteId } /> }
		</Fragment>
	);
};

QueryCanonicalTheme.propTypes = {
	siteId: PropTypes.number,
	themeId: PropTypes.string.isRequired,
	// Connected propTypes
	isWpcom: PropTypes.bool.isRequired,
	isWporg: PropTypes.bool.isRequired,
	isJetpack: PropTypes.bool,
};

export default connect( ( state, { siteId, themeId } ) => ( {
	isWpcom: isWpcomTheme( state, themeId ),
	isWporg: isWporgTheme( state, themeId ),
	isJetpack: !! isJetpackSite( state, siteId ),
} ) )( QueryCanonicalTheme );
