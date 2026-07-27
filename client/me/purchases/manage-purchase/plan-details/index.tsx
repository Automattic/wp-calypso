import { purchaseQuery } from '@automattic/api-queries';
import { isJetpackPlan, isFreeJetpackPlan } from '@automattic/calypso-products';
import { Card, FormLabel } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { localize, LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import QueryPluginKeys from 'calypso/components/data/query-plugin-keys';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SectionHeader from 'calypso/components/section-header';
import { getPluginsForSite } from 'calypso/state/plugins/premium/selectors';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import { getName, isPartnerPurchase, isRemoved } from '../../lib/raw-purchase-helpers';
import PlanBillingPeriod from './billing-period';
import type { Purchase } from '@automattic/api-core';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

export interface PurchasePlanDetailsConnectedProps {
	purchase: Purchase | undefined;
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

		if ( ! purchase || isRemoved( purchase ) ) {
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

const ConnectedPurchasePlanDetails = connect(
	(
		state,
		props: PurchasePlanDetailsProps & {
			purchase: Purchase | undefined;
			hasLoadedPurchasesFromServer: boolean;
		}
	) => {
		const { purchase } = props;
		const siteId = purchase ? purchase.blog_id : null;
		return {
			hasLoadedSites: ! isRequestingSites( state ),
			site: purchase ? getSite( state, purchase.blog_id ) : null,
			hasLoadedPurchasesFromServer: props.hasLoadedPurchasesFromServer,
			purchase,
			pluginList: getPluginsForSite( state, siteId ?? 0 ),
			siteId,
		};
	}
)( localize( PurchasePlanDetails ) );

export default function PurchasePlanDetailsContainer( props: PurchasePlanDetailsProps ) {
	const { data: purchase, isPending } = useQuery( {
		...purchaseQuery( Number( props.purchaseId ) ),
		enabled: Boolean( props.purchaseId ),
	} );
	return (
		<ConnectedPurchasePlanDetails
			{ ...props }
			purchase={ purchase }
			hasLoadedPurchasesFromServer={ ! isPending }
		/>
	);
}
