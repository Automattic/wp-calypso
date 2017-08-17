/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import versionCompare from 'lib/version-compare';
import { getSite, getSiteSlug } from 'state/sites/selectors';
import { getPluginOnSite, isRequesting } from 'state/plugins/installed/selectors';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';

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
	( state, { pluginId, siteId } ) => {
		const site = getSite( state, siteId );

		return {
			pluginActive: !! site && get( getPluginOnSite( state, site, pluginId ), 'active', false ),
			pluginVersion: site && get( getPluginOnSite( state, site, pluginId ), 'version' ),
			requestingPlugins: isRequesting( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
		};
	}
)( ExtensionRedirect );
