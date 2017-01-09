/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import ClipboardButtonInput from 'components/clipboard-button-input';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import { getPurchase, isDataLoading } from '../utils';
import { isJetpackPlan, isFreeJetpackPlan } from 'lib/products-values';
import { getPluginsForSite } from 'state/plugins/premium/selectors';

class ManagePurchaseApiKeys extends Component {
	renderPluginLabel( slug ) {
		switch ( slug ) {
			case 'vaultpress':
				return 'VaultPress';
			case 'akismet':
				return 'Akismet';
			case 'polldaddy':
				return 'Polldaddy';
		}
	}

	render() {
		if ( isDataLoading( this.props ) || ! this.props.selectedSite ) {
			return null;
		}

		const { selectedSite, pluginList } = this.props;
		const purchase = getPurchase( this.props );
		if ( ! isJetpackPlan( purchase ) || isFreeJetpackPlan( purchase ) ) {
			return null;
		}

		return (
			<Card>
				<QueryPluginKeys siteId={ selectedSite.ID } />
				{ pluginList.map( ( plugin, i ) => {
					return (
						<p key={ i }>
							{ this.renderPluginLabel( plugin.slug ) }
							<ClipboardButtonInput value={ plugin.key } />
						</p>
					);
				} ) }
			</Card>
		);
	}
}

export default connect(
	( state, props ) => ( {
		pluginList: getPluginsForSite( state, props.selectedSite.ID ),
	} )
)( ManagePurchaseApiKeys );
