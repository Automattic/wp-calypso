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
import { getSite, getSiteSlug } from 'state/sites/selectors';
import { getPluginOnSite, isRequesting } from 'state/plugins/installed/selectors';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';

class ExtensionRedirect extends Component {
	static propTypes = {
		pluginId: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		// Connected props
		pluginActive: PropTypes.bool.isRequired,
		requestingPlugins: PropTypes.bool.isRequired,
		siteSlug: PropTypes.string,
	}

	componentWillReceiveProps( nextProps ) {
		// Has the request completed? Is the plugin active?
		if ( this.props.requestingPlugins && ! nextProps.requestingPlugins && ! nextProps.pluginActive ) {
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
			requestingPlugins: isRequesting( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
		};
	}
)( ExtensionRedirect );
