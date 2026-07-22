import { fetchPreferences, updatePreferences } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { UserPreferences } from '@automattic/api-core';

const defaultValues: Required< UserPreferences > = {
	recentSites: [],
	'hosting-dashboard-color-scheme': 'light',
	'hosting-dashboard-dark-mode-announcement-dismissed': '',
	'hosting-dashboard-opt-in': { value: 'unset', updated_at: '' },
	'hosting-dashboard-opt-in-welcome-modal-dismissed': '',
	'hosting-dashboard-welcome-notice-dismissed': '',
	'account-recovery-interstitial-snoozed-until': 0,
	'reader-landing-page': {
		useReaderAsLandingPage: false,
		updatedAt: 0,
	},
	'sites-landing-page': {
		useSitesAsLandingPage: false,
		updatedAt: 0,
	},
	'achievements-visibility': 'private',
	'achievements-global-notifications': 'enabled',
	'reader-profile-posts-visibility': 'public',
	'reader-profile-sites-visibility': 'public',
	'reader-profile-hidden-sites': [],
};

const staticPreferenceStatIds: Record< string, string > = {
	recentSites: 'recent',
	'hosting-dashboard-color-scheme': 'color',
	'hosting-dashboard-dark-mode-announcement-dismissed': 'darkann',
	'hosting-dashboard-opt-in': 'optin',
	'hosting-dashboard-opt-in-welcome-modal-dismissed': 'optwelc',
	'hosting-dashboard-welcome-notice-dismissed': 'welcome',
	'account-recovery-interstitial-snoozed-until': 'acctrec',
	'reader-landing-page': 'rdland',
	'sites-landing-page': 'stland',
	'achievements-visibility': 'achvis',
	'achievements-global-notifications': 'achnot',
	'reader-profile-posts-visibility': 'postvis',
	'reader-profile-sites-visibility': 'sitevis',
	'reader-profile-hidden-sites': 'hidsit',
};

const dynamicPreferenceStatPrefixes: Record< string, string > = {
	'hosting-dashboard-dataviews-view': 'dvview',
	'hosting-dashboard-visit-count': 'visits',
	'hosting-dashboard-overview-storage-notice-dismissed': 'storage',
	'hosting-dashboard-tours': 'tours',
	'hosting-dashboard-time-mismatch-warning-dismissed': 'timewrn',
	'hosting-dashboard-wp-beta-notice-dismissed': 'wpbeta',
	'cancel-purchase-survey-completed': 'cncsvy',
	'cancellation-offer-accepted-notice-dismissed': 'cncofr',
};

function getUserPreferenceMutationStatId(
	statId: string,
	preferenceName: keyof UserPreferences
): string {
	const preferenceKey = String( preferenceName );
	const staticStatId = staticPreferenceStatIds[ preferenceKey ];

	if ( staticStatId ) {
		return `${ statId }.${ staticStatId }`;
	}

	const dynamicStatId = Object.entries( dynamicPreferenceStatPrefixes ).find( ( [ prefix ] ) =>
		preferenceKey.startsWith( `${ prefix }-` )
	)?.[ 1 ];

	return `${ statId }.${ dynamicStatId ?? 'other' }`;
}

// Returns all user preferences, without applying any defaults.
export const rawUserPreferencesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'preferences' ],
		queryFn: fetchPreferences,
	} );

export const userPreferenceQuery = < P extends keyof UserPreferences >( preferenceName: P ) =>
	queryOptions( {
		queryKey: rawUserPreferencesQuery().queryKey,
		queryFn: fetchPreferences,
		select: ( data ): Required< UserPreferences >[ P ] => {
			const fetchedValue = data[ preferenceName ];
			return fetchedValue === undefined
				? defaultValues[ preferenceName ]
				: // `fetchedValue` is a `NonNullable< UserPreferences[ P ] >`, which we know is the same
				  // as `Required< UserPreferences >[ P ]`, but the later gives better type hints when
				  // the query is used in the component.
				  ( fetchedValue as Required< UserPreferences >[ P ] );
		},
	} );

export const userPreferenceMutation = < P extends keyof UserPreferences >( preferenceName: P ) =>
	mutationOptions( {
		meta: {
			statId: getUserPreferenceMutationStatId( 'user-pref-update', preferenceName ),
		},
		mutationFn: ( data: UserPreferences[ P ] ) =>
			updatePreferences( {
				[ preferenceName ]: data ?? null, // null means deleting the preference
			} as Partial< UserPreferences > ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( rawUserPreferencesQuery().queryKey, ( oldData ) => {
				return mergePreferences( oldData, preferenceName, newData );
			} );
		},
	} );

export const userPreferenceOptimisticMutation = < P extends keyof UserPreferences >(
	preferenceName: P
) =>
	mutationOptions( {
		meta: {
			statId: getUserPreferenceMutationStatId( 'user-pref-opt-update', preferenceName ),
		},
		mutationFn: userPreferenceMutation( preferenceName ).mutationFn,
		onMutate: async ( value ) => {
			await queryClient.cancelQueries( { queryKey: rawUserPreferencesQuery().queryKey } );
			const previous = queryClient.getQueryData( rawUserPreferencesQuery().queryKey );

			const newData = { [ preferenceName ]: value } as UserPreferences;
			queryClient.setQueryData( rawUserPreferencesQuery().queryKey, ( oldData ) => {
				return mergePreferences( oldData, preferenceName, newData );
			} );

			return { previous };
		},
		onError: ( _err, _variables, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( rawUserPreferencesQuery().queryKey, context.previous );
			}
		},
	} );

export const userPreferencesMutation = () =>
	mutationOptions( {
		meta: { statId: 'user-prefs-update' },
		mutationFn: ( data: Partial< UserPreferences > ) => updatePreferences( data ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData( rawUserPreferencesQuery().queryKey, ( oldData ) =>
				oldData ? { ...oldData, ...newData } : newData
			);
		},
	} );

function mergePreferences< P extends keyof UserPreferences >(
	oldData: UserPreferences | undefined,
	newPreferenceName: P,
	newData: UserPreferences
) {
	if ( ! oldData ) {
		return newData;
	}

	// If newData doesn't contain the preference name, it means it was unset.
	// We need to remove it from oldData.
	if ( ! ( newPreferenceName in newData ) ) {
		const { [ newPreferenceName ]: _, ...rest } = oldData;
		return { ...rest, ...newData };
	}

	return { ...oldData, ...newData };
}
