/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PluginPanel from 'my-sites/plugins-wpcom/plugin-panel';

export const WpcomPluginsPanel = ( { category, search } ) => <PluginPanel { ...{ category, search } } />;

export default WpcomPluginsPanel;
