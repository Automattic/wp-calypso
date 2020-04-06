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
import { Card } from '@automattic/components';
import ClipboardButtonInput from 'components/clipboard-button-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import SectionHeader from 'components/section-header';
import PlanBillingPeriod from './billing-period';
import { isRequestingSites, getSite } from 'state/sites/selectors';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { isDataLoading } from 'me/purchases/utils';
import { getName, isExpired, isPartnerPurchase } from 'lib/purchases';
import { isJetpackPlan, isFreeJetpackPlan } from 'lib/products-values';
import { getPluginsForSite } from 'state/plugins/premium/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export class PurchasePlanDetails extends Component {
	static propTypes = {
		purchaseId: PropTypes.number,
		isPlaceholder: PropTypes.bool,

		// Connected props
		purchase: PropTypes.object,
		hasLoadedSites: PropTypes.bool,
		hasLoadedUserPurchasesFromServer: PropTypes.bool,
		pluginList: PropTypes.arrayOf(
			PropTypes.shape( {
				slug: PropTypes.string.isRequired,
				key: PropTypes.string,
			} ).isRequired
		).isRequired,
		site: PropTypes.object,
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
		const { pluginList, purchase, site, siteId, translate } = this.props;

		// Short out as soon as we know it's not a Jetpack plan
		if ( purchase && ( ! isJetpackPlan( purchase ) || isFreeJetpackPlan( purchase ) ) ) {
			return null;
		}

		if ( isDataLoading( this.props ) || this.props.isPlaceholder ) {
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
				{ siteId && <QueryPluginKeys siteId={ siteId } /> }
				<SectionHeader label={ headerText } />
				<Card>
					{ ! isPartnerPurchase( purchase ) && (
						<PlanBillingPeriod purchase={ purchase } site={ site } />
					) }

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
export default connect( ( state, props ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const siteId = purchase ? purchase.siteId : null;
	return {
		hasLoadedSites: ! isRequestingSites( state ),
		site: purchase ? getSite( state, purchase.siteId ) : null,
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		purchase,
		pluginList: getPluginsForSite( state, siteId ),
		siteId,
	};
} )( localize( PurchasePlanDetails ) );
