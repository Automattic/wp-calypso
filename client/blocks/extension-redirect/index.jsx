/**
 * External dependencies
 */
import { get } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import versionCompare from 'lib/version-compare';
import { getPluginOnSite, isRequesting } from 'state/plugins/installed/selectors';
import { getSiteSlug } from 'state/sites/selectors';

class ExtensionRedirect extends Component {
	static propTypes = {
		minimumVersion: PropTypes.string,
		pluginId: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		// Connected props
		pluginActive: PropTypes.bool.isRequired,
		pluginVersion: PropTypes.string,
		requestingPlugins: PropTypes.bool.isRequired,
		siteSlug: PropTypes.string,
	}

	componentWillReceiveProps( nextProps ) {
		// Check for the following:
		// Is the plugin active? (That implicitly also checks if the plugin is installed)
		// Do we require a minimum version? Have we received the plugin's version? Is it sufficient?
		if ( nextProps.pluginActive && (
			nextProps.minimumVersion && nextProps.pluginVersion &&
			versionCompare( nextProps.minimumVersion, nextProps.pluginVersion, '<=' )
		) ) {
			return;
		}

		// Has the request completed?
		// If it has, and the above criteria aren't fulfilled, we redirect.
		if ( this.props.requestingPlugins && ! nextProps.requestingPlugins ) {
			page.redirect( `/plugins/${ nextProps.pluginId }/${ nextProps.siteSlug }` );
		}
	}

	render() {
		if ( ! this.props.siteId ) {
			return null;
		}

		return (
			<QueryJetpackPlugins siteIds={ [ this.props.siteId ] } />
		);
	}
}

export default connect(
	( state, { pluginId, siteId } ) => ( {
		pluginActive: get( getPluginOnSite( state, siteId, pluginId ), 'active', false ),
		pluginVersion: get( getPluginOnSite( state, siteId, pluginId ), 'version' ),
		requestingPlugins: isRequesting( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	} )
)( ExtensionRedirect );
