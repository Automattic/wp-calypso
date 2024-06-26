import { Moment } from 'moment';
import wasTrialSite from 'calypso/state/selectors/was-trial-site';
import { getSite } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';
import getECommerceTrialDaysLeft from './get-ecommerce-trial-days-left';
import getECommerceTrialExpiration from './get-ecommerce-trial-expiration';
import getHostingTrialDaysLeft from './get-hosting-trial-days-left';
import getHostingTrialExpiration from './get-hosting-trial-expiration';
import getMigrationTrialDaysLeft from './get-migration-trial-days-left';
import getMigrationTrialExpiration from './get-migration-trial-expiration';
import isECommerceTrialExpired from './is-ecommerce-trial-expired';
import isHostingTrialExpired from './is-hosting-trial-expired';
import isMigrationTrialExpired from './is-migration-trial-expired';
import isSiteOnECommerceTrial from './is-site-on-ecommerce-trial';
import isSiteOnHostingTrial from './is-site-on-hosting-trial';
import isSiteOnMigrationTrial from './is-site-on-migration-trial';

export function getTrialDaysLeft( state: AppState, siteId: number ): number | null {
	if ( isSiteOnECommerceTrial( state, siteId ) ) {
		return getECommerceTrialDaysLeft( state, siteId );
	}

	if ( isSiteOnMigrationTrial( state, siteId ) ) {
		return getMigrationTrialDaysLeft( state, siteId );
	}

	if ( isSiteOnHostingTrial( state, siteId ) ) {
		return getHostingTrialDaysLeft( state, siteId );
	}

	return null;
}

export function getTrialExpiration( state: AppState, siteId: number ): Moment | null {
	if ( isSiteOnECommerceTrial( state, siteId ) ) {
		return getECommerceTrialExpiration( state, siteId );
	}

	if ( isSiteOnMigrationTrial( state, siteId ) ) {
		return getMigrationTrialExpiration( state, siteId );
	}

	if ( isSiteOnHostingTrial( state, siteId ) ) {
		return getHostingTrialExpiration( state, siteId );
	}

	return null;
}

export function isTrialExpired( state: AppState, siteId: number ): boolean | null {
	const site = getSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	if ( isSiteOnECommerceTrial( state, siteId ) ) {
		return isECommerceTrialExpired( state, siteId );
	}

	if ( isSiteOnMigrationTrial( state, siteId ) ) {
		return isMigrationTrialExpired( state, siteId );
	}

	if ( isSiteOnHostingTrial( state, siteId ) ) {
		return isHostingTrialExpired( state, siteId );
	}

	if ( wasTrialSite( state, siteId ) ) {
		return true;
	}

	return null;
}
