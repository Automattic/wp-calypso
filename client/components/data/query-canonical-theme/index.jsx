import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { connect } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import { getTheme, isWpcomTheme, isWporgTheme } from 'calypso/state/themes/selectors';
import { knownConflictingThemes } from 'calypso/state/themes/selectors/get-canonical-theme';

const QueryCanonicalTheme = ( { siteId, themeId, isRetiredWpcom, isWpcom, isWporg } ) => {
	// Conflicting themes are themes we always search Jetpack+Atomic sites for information about.
	// Usually, it's only searched if we can't find info on both Wpcom and Wporg.
	const isConflictingTheme = knownConflictingThemes.has( themeId );
	return (
		<Fragment>
			<QueryTheme themeId={ themeId } siteId="wpcom" />
			{ ! isWpcom && <QueryTheme themeId={ themeId } siteId="wporg" /> }
			{ ( isRetiredWpcom || ( ! isWpcom && ! isWporg ) || isConflictingTheme ) && siteId && (
				<QueryTheme themeId={ themeId } siteId={ siteId } />
			) }
		</Fragment>
	);
};

QueryCanonicalTheme.propTypes = {
	siteId: PropTypes.number,
	themeId: PropTypes.string.isRequired,
	// Connected propTypes
	isRetiredWpcom: PropTypes.bool.isRequired,
	isWpcom: PropTypes.bool.isRequired,
	isWporg: PropTypes.bool.isRequired,
};

export default connect( ( state, { themeId } ) => ( {
	isRetiredWpcom: Boolean( getTheme( state, 'wpcom', themeId )?.retired ),
	isWpcom: isWpcomTheme( state, themeId ),
	isWporg: isWporgTheme( state, themeId ),
} ) )( QueryCanonicalTheme );
