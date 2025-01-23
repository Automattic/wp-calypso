import config from '@automattic/calypso-config';
import { SiteGoal, SiteIntent } from './constants';

export const goalsToIntent = ( goals: SiteGoal[] ): SiteIntent => {
	// When DIFM and Import goals are selected together, DIFM Intent will have the priority and will be set.
	if ( goals.includes( SiteGoal.DIFM ) ) {
		return SiteIntent.DIFM;
	}

	if ( goals.includes( SiteGoal.Import ) ) {
		return SiteIntent.Import;
	}

	// Prioritize Sell over Build and Write
	if (
		goals.some( ( goal ) =>
			[ SiteGoal.Sell, SiteGoal.SellDigital, SiteGoal.SellPhysical ].includes( goal )
		)
	) {
		return SiteIntent.Sell;
	}

	// Prioritize Build over Write
	if ( goals.includes( SiteGoal.Promote ) ) {
		return SiteIntent.Build;
	}

	if ( goals.includes( SiteGoal.Write ) ) {
		return SiteIntent.Write;
	}

	// Newsletter flow
	if ( config.isEnabled( 'onboarding/newsletter-goal' ) && goals.includes( SiteGoal.Newsletter ) ) {
		return SiteIntent.NewsletterGoal;
	}

	return SiteIntent.Build;
};

export const serializeGoals = ( goals: SiteGoal[] ): string => {
	// Serialize goals by first + alphabetical order.
	const firstGoal = goals.find( ( goal ) =>
		[ SiteGoal.Write, SiteGoal.Sell, SiteGoal.Promote, SiteGoal.DIFM, SiteGoal.Import ].includes(
			goal
		)
	);

	return ( firstGoal ? [ firstGoal ] : [] )
		.concat( goals.filter( ( goal ) => goal !== firstGoal ).sort() )
		.join( ',' );
};
