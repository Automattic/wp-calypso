import ECommerceTrialExpired from './ecommerce-trial-expired';
import TrialUpgradeConfirmation from './upgrade-confirmation';

export function trialExpired( context, next ) {
	context.primary = <ECommerceTrialExpired />;
	next();
}

export function trialUpgradeConfirmation( context, next ) {
	context.primary = <TrialUpgradeConfirmation />;
	next();
}
