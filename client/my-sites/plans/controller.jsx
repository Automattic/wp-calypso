import page from 'page';
import { isValidFeatureKey } from 'calypso/lib/plans/features-list';
import { productSelect } from 'calypso/my-sites/plans/jetpack-plans/controller';
import setJetpackPlansHeader from 'calypso/my-sites/plans/jetpack-plans/plans-header';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import Plans from './plans';

function showJetpackPlans( context ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const isWpcom = isSiteWpcom( state, siteId );
	return ! isWpcom;
}

export function plans( context, next ) {
	if ( showJetpackPlans( context ) ) {
		if ( context.params.intervalType ) {
			return page.redirect( `/plans/${ context.params.site }` );
		}
		setJetpackPlansHeader( context );
		return productSelect( '/plans' )( context, next );
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
			domainAndPlanPackage={ context.query.domainAndPlanPackage }
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

export const redirectIfInvalidInterval = ( context, next ) => {
	const { intervalType } = context.params;
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	// Passlist the intervals here to avoid "foo" values passing through
	if ( intervalType && ! [ 'monthly', 'yearly', '2yearly', '3yearly' ].includes( intervalType ) ) {
		page.redirect( selectedSite ? `/plans/yearly/${ selectedSite.slug }` : '/plans' );
		return null;
	}

	next();
};
