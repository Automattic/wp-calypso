import TrialUpgradeConfirmation from './upgrade-confirmation';

export function trialUpgradeConfirmation( context, next ) {
	context.primary = <TrialUpgradeConfirmation />;
	next();
}
