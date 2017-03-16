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
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
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
					if ( 'vaultpress' === plugin.slug )
						plugin.key = '5bGeNE9vQceyS2VL2ZmIbL4bdaaa3vVR5Omu4kZ311';
					else
						plugin.key = '0078qyIuSZow';
					return (
						<FormFieldset key={ i }>
							<FormLabel htmlFor={ `plugin-${ plugin.slug }` }>{ this.renderPluginLabel( plugin.slug ) }</FormLabel>
							<ClipboardButtonInput id={ `plugin-${ plugin.slug }` } value={ plugin.key } />
						</FormFieldset>
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
