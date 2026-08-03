import {
	fetchJetpackSettings,
	isPlainObject,
	isPostByEmailAddress,
	POST_BY_EMAIL_ACTIONS,
	updateJetpackSettings,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { siteQueryFilter } from './site';
import type { JetpackSettings } from '@automattic/api-core';

function getSettingsFromMutationResponse( response: unknown ): Partial< JetpackSettings > {
	const payload =
		isPlainObject( response ) && isPlainObject( response.data ) ? response.data : response;

	if ( ! isPlainObject( payload ) ) {
		return {};
	}

	const settings = { ...payload };
	delete settings.code;
	delete settings.data;
	delete settings.message;

	return settings as Partial< JetpackSettings >;
}

function normalizeJetpackSettingsMutationResult(
	response: unknown,
	settings: Partial< JetpackSettings >
): Partial< JetpackSettings > {
	const responseSettings = getSettingsFromMutationResponse( response );
	const normalizedSettings: Partial< JetpackSettings > = {
		...settings,
		...responseSettings,
	};

	if ( 'post_by_email_address' in settings ) {
		const requestedPostByEmailAddress = settings.post_by_email_address;
		const returnedPostByEmailAddress = responseSettings.post_by_email_address;

		if ( requestedPostByEmailAddress === 'delete' ) {
			normalizedSettings.post_by_email_address = undefined;
		} else if ( isPostByEmailAddress( returnedPostByEmailAddress ) ) {
			normalizedSettings.post_by_email_address = returnedPostByEmailAddress;
		} else if (
			typeof normalizedSettings.post_by_email_address === 'string' &&
			POST_BY_EMAIL_ACTIONS.has( normalizedSettings.post_by_email_address.trim().toLowerCase() )
		) {
			delete normalizedSettings.post_by_email_address;
		}
	}

	return normalizedSettings;
}

export const siteJetpackSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'jetpack-settings' ],
		queryFn: () => fetchJetpackSettings( siteId ),
	} );

export const siteJetpackSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		meta: { statId: 'site-jp-settings-update' },
		mutationFn: ( settings: Partial< JetpackSettings > ) =>
			updateJetpackSettings( siteId, settings ),
		onSuccess: ( newData: unknown, newSettings: Partial< JetpackSettings > ) => {
			const normalizedSettings = normalizeJetpackSettingsMutationResult( newData, newSettings );

			queryClient.setQueryData( siteJetpackSettingsQuery( siteId ).queryKey, ( oldData ) => ( {
				...oldData,
				...normalizedSettings,
			} ) );
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );
