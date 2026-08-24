import { userPreferenceMutation, userPreferenceOptimisticMutation } from '../me-preferences';
import type { UserPreferences } from '@automattic/api-core';

function getPreferenceMutationStatId( preferenceKey: keyof UserPreferences ) {
	return userPreferenceMutation( preferenceKey ).meta?.statId;
}

function getPreferenceOptimisticMutationStatId( preferenceKey: keyof UserPreferences ) {
	return userPreferenceOptimisticMutation( preferenceKey ).meta?.statId;
}

describe( 'user preference mutation meta', () => {
	it( 'uses short codes for static preferences', () => {
		expect( getPreferenceOptimisticMutationStatId( 'recentSites' ) ).toBe(
			'user-pref-opt-update.recent'
		);
	} );

	it( 'buckets dynamic dashboard preferences by family', () => {
		expect(
			getPreferenceOptimisticMutationStatId( 'hosting-dashboard-visit-count-deployments' )
		).toBe( 'user-pref-opt-update.visits' );

		expect(
			getPreferenceOptimisticMutationStatId( 'hosting-dashboard-dataviews-view-sites' )
		).toBe( 'user-pref-opt-update.dvview' );
	} );

	it( 'buckets dynamic purchase preferences by family', () => {
		expect( getPreferenceMutationStatId( 'cancel-purchase-survey-completed-123' ) ).toBe(
			'user-pref-update.cncsvy'
		);

		expect(
			getPreferenceMutationStatId( 'cancellation-offer-accepted-notice-dismissed-123' )
		).toBe( 'user-pref-update.cncofr' );
	} );

	it( 'uses an other bucket for unknown preference keys', () => {
		expect(
			getPreferenceMutationStatId( 'experimental-preference' as keyof UserPreferences )
		).toBe( 'user-pref-update.other' );
	} );

	it( 'keeps stat IDs within the length limit', () => {
		const preferenceKeys: Array< keyof UserPreferences > = [
			'recentSites',
			'hosting-dashboard-dark-mode-announcement-dismissed',
			'hosting-dashboard-opt-in-welcome-modal-dismissed',
			'account-recovery-interstitial-snoozed-until',
			'reader-profile-posts-visibility',
			'reader-profile-sites-visibility',
			'hosting-dashboard-overview-storage-notice-dismissed-123',
			'hosting-dashboard-time-mismatch-warning-dismissed-123',
			'cancellation-offer-accepted-notice-dismissed-123',
			'experimental-preference' as keyof UserPreferences,
		];

		preferenceKeys.forEach( ( preferenceKey ) => {
			expect( getPreferenceMutationStatId( preferenceKey )?.length ).toBeLessThanOrEqual( 28 );
			expect( getPreferenceOptimisticMutationStatId( preferenceKey )?.length ).toBeLessThanOrEqual(
				28
			);
		} );
	} );
} );
