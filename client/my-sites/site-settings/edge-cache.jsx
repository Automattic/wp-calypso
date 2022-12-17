import { Card, ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryEdgeCacheActive from 'calypso/components/data/query-site-edge-cache';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class EdgeCacheSettings extends Component {
	render() {
		const { siteId, translate } = this.props;

		return (
			<Fragment>
				<QueryEdgeCacheActive siteId={ siteId } />
				<SettingsSectionHeader title={ translate( 'Edge Cache' ) } />
				<Card>
					<div className="site-settings__edge-cache">
						<ToggleControl
							checked={ true }
							disabled={ false }
							label={ translate( 'Enable edge caching' ) }
						></ToggleControl>
					</div>
				</Card>
			</Fragment>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
	};
} )( localize( EdgeCacheSettings ) );
