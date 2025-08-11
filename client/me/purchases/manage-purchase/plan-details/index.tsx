import { isJetpackPlan, isFreeJetpackPlan } from '@automattic/calypso-products';
import { Card, FormLabel } from '@automattic/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import QueryPluginKeys from 'calypso/components/data/query-plugin-keys';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SectionHeader from 'calypso/components/section-header';
import { getName, isExpired, isPartnerPurchase } from 'calypso/lib/purchases';
import { getPluginsForSite } from 'calypso/state/plugins/premium/selectors';
import {
	getByPurchaseId,
	hasLoadedSitePurchasesFromServer,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import PlanBillingPeriod from './billing-period';
import type { Purchases, SiteDetails } from '@automattic/data-stores';

import './style.scss';

export interface PurchasePlanDetailsConnectedProps {
	purchase: Purchases.Purchase | undefined;
	hasLoadedSites: boolean;
	hasLoadedPurchasesFromServer: boolean;
	pluginList: Array< {
		slug: string;
		key: string;
	} >;
	site: SiteDetails | null | undefined;
	siteId: number | null | undefined;
}

export interface PurchasePlanDetailsProps {
	purchaseId: number;
	isPlaceholder?: boolean;
	isProductOwner?: boolean;
}

export class PurchasePlanDetails extends Component<
	PurchasePlanDetailsProps & PurchasePlanDetailsConnectedProps & LocalizeProps
> {
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

	renderPluginLabel( slug: string ) {
		switch ( slug ) {
			case 'vaultpress':
				return this.props.translate( 'Backups and security scanning API key' );
			case 'akismet':
				return this.props.translate( 'Akismet Anti-spam API key' );
		}
	}

	isDataLoading( props: PurchasePlanDetailsProps & PurchasePlanDetailsConnectedProps ) {
		return ! props.hasLoadedSites || ! props.hasLoadedPurchasesFromServer;
	}

	render() {
		const { pluginList, purchase, site, siteId, translate, isProductOwner } = this.props;

		// Short out as soon as we know it's not a Jetpack plan
		if ( purchase && ( ! isJetpackPlan( purchase ) || isFreeJetpackPlan( purchase ) ) ) {
			return null;
		}

		if ( this.isDataLoading( this.props ) || this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		if ( ! purchase || isExpired( purchase ) ) {
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
						<PlanBillingPeriod
							purchase={ purchase }
							site={ site }
							isProductOwner={ isProductOwner }
						/>
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

export default connect( ( state, props: PurchasePlanDetailsProps ) => {
	const purchase = getByPurchaseId( state, props.purchaseId );
	const siteId = purchase ? purchase.siteId : null;
	return {
		hasLoadedSites: ! isRequestingSites( state ),
		site: purchase ? getSite( state, purchase.siteId ) : null,
		hasLoadedPurchasesFromServer: siteId
			? hasLoadedSitePurchasesFromServer( state )
			: hasLoadedUserPurchasesFromServer( state ),
		purchase,
		pluginList: getPluginsForSite( state, siteId ?? 0 ),
		siteId,
	};
} )( localize( PurchasePlanDetails ) );
