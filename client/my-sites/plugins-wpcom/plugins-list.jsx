/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

import StandardPluginsPanel from './standard-plugins-panel';

import { defaultStandardPlugins } from './default-plugins';

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
