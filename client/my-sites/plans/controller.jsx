import { isFreePlanProduct, isFlexiblePlanProduct } from '@automattic/calypso-products';
import page from 'page';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { isEligibleForManagedPlan } from 'calypso/my-sites/plans-comparison';
import { productSelect } from 'calypso/my-sites/plans/jetpack-plans/controller';
import setJetpackPlansHeader from 'calypso/my-sites/plans/jetpack-plans/plans-header';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import { getSite } from 'calypso/state/sites/selectors';
import { default as getIsJetpackProductSite } from 'calypso/state/sites/selectors/is-jetpack-product-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Plans from './plans';

function showJetpackPlans( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const isJetpackProductSite = getIsJetpackProductSite( state, siteId );
	const isWpcom = isSiteWpcom( state, siteId );
	return ! isWpcom || isJetpackProductSite;
}

export function plans( context, next ) {
	if ( showJetpackPlans( context ) ) {
		if ( context.params.intervalType ) {
			return page.redirect( `/plans/${ context.params.site }` );
		}
		setJetpackPlansHeader( context );
		return productSelect( '/plans' )( context, next );
	}

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const selectedSite = getSite( state, siteId );
	const eligibleForManagedPlan = isEligibleForManagedPlan( state, siteId );

	if (
		eligibleForManagedPlan &&
		! isFreePlanProduct( selectedSite.plan ) &&
		! isFlexiblePlanProduct( selectedSite.plan )
	) {
		page.redirect( `/plans/my-plan/${ selectedSite.slug }` );

		return null;
	}

	context.primary = (
		<Plans
			context={ context }
			intervalType={ context.params.intervalType }
			customerType={ context.query.customerType }
			selectedFeature={ context.query.feature }
			selectedPlan={ context.query.plan }
			withDiscount={ context.query.discount }
			discountEndDate={ context.query.ts }
			redirectTo={ context.query.redirect_to }
			redirectToAddDomainFlow={
				context.query.addDomainFlow !== undefined
					? context.query.addDomainFlow === 'true'
					: undefined
			}
		/>
	);
	next();
}

export function features( context ) {
	const { feature, domain } = context.params;
	let comparePath = domain ? `/plans/${ domain }` : '/plans/';

	if ( isValidFeatureKey( feature ) ) {
		comparePath += '?feature=' + feature;
	}

	// otherwise redirect to the compare page if not found
	page.redirect( comparePath );
}

export function redirectToCheckout( context ) {
	// this route is deprecated, use `/checkout/:site/:plan` to link to plan checkout
	page.redirect( `/checkout/${ context.params.domain }/${ context.params.plan }` );
}

export function redirectToPlans( context ) {
	const siteDomain = context.params.domain;

	if ( siteDomain ) {
		return page.redirect( `/plans/${ siteDomain }` );
	}

	return page.redirect( '/plans' );
}

export function redirectToPlansIfNotJetpack( context, next ) {
	if ( ! showJetpackPlans( context ) ) {
		page.redirect( `/plans/${ context.params.site }` );
	}
	next();
}
