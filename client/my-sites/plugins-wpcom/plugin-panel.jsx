import React from 'react';
import { connect } from 'react-redux';

import Card from 'components/card';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

import InfoHeader from './info-header';
import StandardPluginsPanel from './standard-plugins-panel';
import PremiumPluginsPanel from './premium-plugins-panel';

import BusinessPluginsPanel from './business-plugins-panel';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { defaultBusinessPlugins } from './default-plugins';

/*
 * Interpolate the given plugin propagating `siteSlug` value
 */
const linkInterpolator = siteSlug => plugin => {
	const { descriptionLink: link } = plugin;
	const descriptionLink = link.replace( '{siteSlug}', siteSlug );
	return Object.assign( {}, plugin, { descriptionLink } );
}

export const PluginPanel = React.createClass( {
	render() {
		const { siteSlug } = this.props;
		const standardPluginsLink = `/plugins/standard/${ siteSlug }`;

		const interpolateLink = linkInterpolator( siteSlug );
		const businessPlugins = defaultBusinessPlugins.map( interpolateLink );

		return (
			<div className="wpcom-plugin-panel">
				<PageViewTracker path="/plugins/:site" title="Plugins > WPCOM Site" />
				<InfoHeader />
				<StandardPluginsPanel displayCount={ 6 } />
				<Card className="wpcom-plugin-panel__panel-footer" href={ standardPluginsLink }>
					{ this.translate( 'View all standard plugins' ) }
				</Card>
				<PremiumPluginsPanel />
				<BusinessPluginsPanel plugins={ businessPlugins } />
			</div>
		);
	}
} );

const mapStateToProps = state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( PluginPanel );
