import {
	JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION,
	PLAN_JETPACK_FREE,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import JetpackPluginUpdateWarning from 'calypso/blocks/jetpack-plugin-update-warning';
import FormattedHeader from 'calypso/components/formatted-header';
import Notice from 'calypso/components/notice';
import PlansNavigation from 'calypso/my-sites/plans/navigation';
import { useSelector } from 'calypso/state';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getPlanRecommendationFromContext } from './plan-upgrade/utils';
import type { Context } from '@automattic/calypso-router';

type HeaderProps = {
	context: Context;
	shouldShowPlanRecommendation?: boolean;
};

type StandardHeaderProps = {
	shouldShowPlanRecommendation?: boolean;
	siteId: number | null;
};

const StandardPlansHeader = ( { shouldShowPlanRecommendation, siteId }: StandardHeaderProps ) => (
	<>
		<FormattedHeader headerText={ translate( 'Plans' ) } align="left" brandFont />
		<PlansNavigation path="/plans" />
		{ shouldShowPlanRecommendation && siteId && (
			<JetpackPluginUpdateWarning
				siteId={ siteId }
				minJetpackVersion={ JETPACK_LEGACY_PLANS_MAX_PLUGIN_VERSION }
			/>
		) }
		{ ! shouldShowPlanRecommendation && (
			<h2 className="jetpack-plans__pricing-header">
				{ translate( 'Security, performance, and marketing tools by the WordPress experts' ) }
			</h2>
		) }
	</>
);

const ConnectFlowPlansHeader = () => (
	<>
		<div className="jetpack-plans__heading">
			<FormattedHeader
				headerText={ translate( 'Explore our Jetpack plans' ) }
				subHeaderText={ translate( "Now that you're set up, pick a plan that fits your needs." ) }
				align="left"
				brandFont
			/>
		</div>
		<PlansNavigation path="/plans" />
	</>
);

const PlansHeader = ( { context, shouldShowPlanRecommendation }: HeaderProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	// Site plan
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	// Site products from direct purchases
	const purchasedProducts = useSelector( ( state ) => {
		const products = getSiteProducts( state, siteId );
		if ( ! products ) {
			return [];
		}

		return products
			.map( ( { productSlug } ) => productSlug )
			.filter( ( productSlug ) =>
				( JETPACK_PRODUCTS_LIST as ReadonlyArray< string > ).includes( productSlug )
			);
	} );

	// When coming from in-connect flow, the url contains 'source=jetpack-connect-plans' query param.
	const isInConnectFlow = context.query?.source === 'jetpack-connect-plans';

	const [ showNotice, setShowNotice ] = useState( true );

	// Only show ConnectFlowPlansHeader if coming from in-connect flow and if no products or plans have been purchased.
	return isInConnectFlow && currentPlan === PLAN_JETPACK_FREE && ! purchasedProducts.length ? (
		<>
			{ showNotice && (
				<Notice status="is-success" onDismissClick={ () => setShowNotice( false ) }>
					{ translate( 'Jetpack is now connected. Next select a plan.' ) }
				</Notice>
			) }
			<ConnectFlowPlansHeader />
		</>
	) : (
		<StandardPlansHeader
			shouldShowPlanRecommendation={ shouldShowPlanRecommendation }
			siteId={ siteId }
		/>
	);
};

export default function setJetpackHeader( context: Context ) {
	const planRecommendation = getPlanRecommendationFromContext( context );
	const shouldShowPlanRecommendation = !! planRecommendation;

	context.header = (
		<>
			<PlansHeader
				context={ context }
				shouldShowPlanRecommendation={ shouldShowPlanRecommendation }
			/>
		</>
	);
}
