/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { defaultStandardPlugins } from './default-plugins';
import StandardPluginsPanel from './standard-plugins-panel';
import HeaderCake from 'components/header-cake';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export const PluginsList = ( { siteSlug, translate } ) => (
	<div className="wpcom-plugin-panel wpcom-plugins-expanded">
		<PageViewTracker path="/plugins/category/standard/:site" title="Plugins > WPCOM Site > Standard Plugins" />
		<HeaderCake backHref={ `/plugins/${ siteSlug }` } onClick={ noop }>
			{ translate( 'Standard Plugins' ) }
		</HeaderCake>
		<StandardPluginsPanel plugins={ defaultStandardPlugins } />
	</div>
);

const mapStateToProps = state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( localize( PluginsList ) );
