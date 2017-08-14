/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
		pluginInstalled: PropTypes.bool.isRequired,
		requestingPlugins: PropTypes.bool.isRequired,
		siteId: PropTypes.number
	}

	componentWillReceiveProps( nextProps ) {
		// Has the request completed, and no data have been fetched?
		if ( this.props.requestingPlugins && ! nextProps.requestingPlugins && ! nextProps.pluginInstalled ) {
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
			pluginInstalled: !! ( site && getPluginOnSite( state, site, pluginId ) ),
			requestingPlugins: isRequesting( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
		};
	}
)( ExtensionRedirect );
