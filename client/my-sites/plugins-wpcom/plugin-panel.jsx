import React from 'react';
import { connect } from 'react-redux';

import Card from 'components/card';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

import InfoHeader from './info-header';
import StandardPluginsPanel from './standard-plugins-panel';
import PremiumPluginsPanel from './premium-plugins-panel';
import BusinessPluginsPanel from './business-plugins-panel';

export const PluginPanel = React.createClass( {
	render() {
		const { siteSlug } = this.props;
		const standardPluginsLink = `/plugins/standard/${ siteSlug }`;

		return (
			<div className="wpcom-plugin-panel">
				<InfoHeader />
				<StandardPluginsPanel displayCount={ 6 } />
				<Card className="wpcom-plugin-panel__panel-footer" href={ standardPluginsLink }>
					{ this.translate( 'View all standard plugins' ) }
				</Card>
				<PremiumPluginsPanel />
				<BusinessPluginsPanel />
			</div>
		);
	}
} );

const mapStateToProps = state => ( {
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) )
} );

export default connect( mapStateToProps )( PluginPanel );
