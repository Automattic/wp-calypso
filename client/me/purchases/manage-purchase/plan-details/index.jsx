/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import ClipboardButtonInput from 'components/clipboard-button-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import SectionHeader from 'components/section-header';
import PlanBillingPeriod from './billing-period';
import { isRequestingSites } from 'state/sites/selectors';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { isDataLoading } from 'me/purchases/utils';
import { getName, isExpired } from 'lib/purchases';
import { isJetpackPlan, isFreeJetpackPlan } from 'lib/products-values';
import { getPluginsForSite } from 'state/plugins/premium/selectors';

class PurchasePlanDetails extends Component {
	static propTypes = {
		purchase: PropTypes.object,
		siteId: PropTypes.number,
	};

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
		const { pluginList, purchase, siteId, translate } = this.props;

		// Short out as soon as we know it's not a Jetpack plan
		if ( purchase && ( ! isJetpackPlan( purchase ) || isFreeJetpackPlan( purchase ) ) ) {
			return null;
		}

		if ( isDataLoading( this.props ) || ! this.props.siteId ) {
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
				<QueryPluginKeys siteId={ siteId } />
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

// hasLoadedSites & hasLoadedUserPurchasesFromServer are used in isDataLoading
export default connect( ( state, { purchaseId, siteId } ) => ( {
	hasLoadedSites: ! isRequestingSites( state ),
	hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
	purchase: getByPurchaseId( state, purchaseId ),
	pluginList: siteId ? getPluginsForSite( state, siteId ) : [],
} ) )( localize( PurchasePlanDetails ) );
