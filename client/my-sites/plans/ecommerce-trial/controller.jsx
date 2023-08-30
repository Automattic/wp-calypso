import { recordTracksEvent } from 'calypso/state/analytics/actions';
import wasBusinessTrialSite from 'calypso/state/selectors/was-business-trial-site';
import wasEcommerceTrialSite from 'calypso/state/selectors/was-ecommerce-trial-site';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import BusinessTrialExpired from '../trials/business-trial-expired';
import BusinessUpgradeConfirmation from './business-upgrade-confirmation';
import ECommerceTrialExpired from './ecommerce-trial-expired';
import TrialUpgradeConfirmation from './upgrade-confirmation';

export function trialExpired( context, next ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	context.store.dispatch(
		recordTracksEvent( 'calypso_plan_trial_expired_page', {
			site_id: selectedSite.ID,
			was_ecommerce_trial_site: wasEcommerceTrialSite( state, selectedSite.ID ),
			was_business_trial_site: wasBusinessTrialSite( state, selectedSite.ID ),
		} )
	);

	if ( wasEcommerceTrialSite( state, selectedSite.ID ) ) {
		context.primary = <ECommerceTrialExpired />;
	} else if ( wasBusinessTrialSite( state, selectedSite.ID ) ) {
		context.primary = <BusinessTrialExpired />;
	}

	next();
}

export function trialUpgradeConfirmation( context, next ) {
	const state = context.store.getState();
	const selectedSite = getSelectedSite( state );

	if ( wasEcommerceTrialSite( state, selectedSite.ID ) ) {
		context.primary = <TrialUpgradeConfirmation />;
	} else if ( wasBusinessTrialSite( state, selectedSite.ID ) ) {
		context.primary = <BusinessUpgradeConfirmation />;
	}

	next();
}
