/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'client/components/card';
import ClipboardButtonInput from 'client/components/clipboard-button-input';
import FormFieldset from 'client/components/forms/form-fieldset';
import FormLabel from 'client/components/forms/form-label';
import QueryPluginKeys from 'client/components/data/query-plugin-keys';
import SectionHeader from 'client/components/section-header';
import PlanBillingPeriod from './billing-period';
import { isRequestingSites } from 'client/state/sites/selectors';
import {
	getByPurchaseId,
	hasLoadedUserPurchasesFromServer,
} from 'client/state/purchases/selectors';
import { getPurchase, isDataLoading } from 'client/me/purchases/utils';
import { getName, isExpired } from 'client/lib/purchases';
import { isJetpackPlan, isFreeJetpackPlan } from 'client/lib/products-values';
import { getPluginsForSite } from 'client/state/plugins/premium/selectors';

class PurchasePlanDetails extends Component {
	renderPlaceholder() {
		return (
			<div className="plan-details__wrapper is-placeholder">
				<SectionHeader />
				<Card>
					<div className="plan-details__plugin-key" />
					<div className="plan-details__plugin-key" />
				</Card>
			</div>
		);
	}

	renderPluginLabel( slug ) {
		switch ( slug ) {
			case 'vaultpress':
				return this.props.translate( 'Backups and security scanning API key' );
			case 'akismet':
				return this.props.translate( 'Anti-spam API key' );
		}
	}

	render() {
		const { selectedSite, pluginList, translate } = this.props;
		const purchase = getPurchase( this.props );

		// Short out as soon as we know it's not a Jetpack plan
		if ( purchase && ( ! isJetpackPlan( purchase ) || isFreeJetpackPlan( purchase ) ) ) {
			return null;
		}

		if ( isDataLoading( this.props ) || ! this.props.selectedSite ) {
			return this.renderPlaceholder();
		}

		if ( isExpired( purchase ) ) {
			return null;
		}

		const headerText = translate( '%(planName)s Plan', {
			args: {
				planName: getName( purchase ),
			},
		} );

		return (
			<div className="plan-details">
				<QueryPluginKeys siteId={ selectedSite.ID } />
				<SectionHeader label={ headerText } />
				<Card>
					<PlanBillingPeriod purchase={ purchase } />

					{ pluginList.map( ( plugin, i ) => {
						return (
							<FormFieldset key={ i }>
								<FormLabel htmlFor={ `plugin-${ plugin.slug }` }>
									{ this.renderPluginLabel( plugin.slug ) }
								</FormLabel>
								<ClipboardButtonInput id={ `plugin-${ plugin.slug }` } value={ plugin.key } />
							</FormFieldset>
						);
					} ) }
				</Card>
			</div>
		);
	}
}

// hasLoadedSites & hasLoadedUserPurchasesFromServer are used in isDataLoading,
// selectedPurchase is used in getPurchase
export default connect( ( state, props ) => ( {
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	selectedPurchase: getByPurchaseId( state, props.purchaseId ),
	pluginList: props.selectedSite ? getPluginsForSite( state, props.selectedSite.ID ) : [],
} ) )( localize( PurchasePlanDetails ) );
