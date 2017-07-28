/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import EmptyContent from 'components/empty-content';
import HeaderCake from 'components/header-cake';
import QueryActiveTheme from 'components/data/query-active-theme';
import QueryTheme from 'components/data/query-theme';
import { getActiveTheme } from 'state/themes/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getTheme } from 'state/themes/selectors';
import Theme from 'components/theme';

function main( { siteId, activeTheme, theme } ) {
	return (
		<Main>
			{ siteId && <QueryActiveTheme siteId={ siteId } /> }
			{ siteId && activeTheme && <QueryTheme siteId={ siteId } themeId={ activeTheme } /> }
			<HeaderCake backHref="/">Demo Page</HeaderCake>
			{ siteId && theme && <Theme theme={ theme } /> }
			<EmptyContent title="Demo Page" line="Nothing to see here." />
		</Main>
	);
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const activeTheme = getActiveTheme( state, siteId );
		return {
			siteId,
			activeTheme,
			theme: getTheme( state, 'wpcom', activeTheme ),
		};
	}
)( main );
