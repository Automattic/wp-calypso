/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SetupHeader from './setup-header';
import ProgressBar from 'components/progress-bar';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getPlugins } from 'state/plugins/installed/selectors';

const requiredPlugins = [
	'woocommerce',
	'wc-api-dev',
	'woocommerce-services',
];

class RequiredPluginsInstallView extends Component {
	render = () => {
		const { translate, siteId, plugins } = this.props;

		return (
			<div className="card dashboard__setup-wrapper">
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Setting up your store' ) }
					subtitle={ translate( 'Give us a minute and we\'ll move right along.' ) }
				>
					<ProgressBar value={ 75 } isPulsing />
					<ul>
					{ plugins.map( ( plugin ) => (
						<li>{ plugin.name } ({ plugin.active ? 'active' : 'inactive' })</li>
					) ) }
					</ul>
				</SetupHeader>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const selectedSite = getSelectedSiteWithFallback( state );
	const siteId = selectedSite && selectedSite.ID;

	return {
		siteId,
		plugins: getPlugins( state, [ { ID: siteId } ] ),
	};
}

export default connect( mapStateToProps )( localize( RequiredPluginsInstallView ) );
