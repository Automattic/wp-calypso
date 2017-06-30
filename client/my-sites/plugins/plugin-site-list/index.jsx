/**
 * External dependencies
 */
import classNames from 'classnames';
import { compact } from 'lodash';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { isConnectedSecondaryNetworkSite, getNetworkSites } from 'state/selectors';
import PluginSite from 'my-sites/plugins/plugin-site/plugin-site';
import PluginsStore from 'lib/plugins/store';
import SectionHeader from 'components/section-header';

export class PluginSiteList extends Component {
	static propTypes = {
		notices: PropTypes.object,
		plugin: PropTypes.object,
		sites: PropTypes.array,
		sitesWithSecondarySites: PropTypes.array,
		title: PropTypes.string,
	};

	getSecondaryPluginSites( site, secondarySites ) {
		const secondaryPluginSites = site.plugin
			? PluginsStore.getSites( secondarySites, this.props.plugin.slug )
			: secondarySites;
		return compact( secondaryPluginSites );
	}

	renderPluginSite( { site, secondarySites } ) {
		return <PluginSite
				key={ 'pluginSite' + site.ID }
				site={ site }
				secondarySites={ this.getSecondaryPluginSites( secondarySites ) }
				plugin={ this.props.plugin }
				wporg={ this.props.wporg }
				notices={ this.props.notices } />;
	}

	render() {
		if ( ! this.props.sites || this.props.sites.length === 0 ) {
			return null;
		}
		const classes = classNames( 'plugin-site-list', this.props.className ),
			pluginSites = this.props.sitesWithSecondarySites.map( this.renderPluginSite, this );

		return (
			<div className={ classes } >
				<SectionHeader label={ this.props.title } />
				{ pluginSites }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const sitesWithSecondarySites = props.sites
		.filter( ( site ) => ! isConnectedSecondaryNetworkSite( state, site.ID )	)
		.map( ( site ) => ( {
			site,
			secondarySites: getNetworkSites( state, site.ID )
		} ) );

		return {
			sitesWithSecondarySites
		};
	}
)( PluginSiteList );
