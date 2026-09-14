import { updateJetpackSettings } from '../site-jetpack-settings/mutators';
import { wpcom } from '../wpcom-fetcher';
import {
	getSettingsFromJetpackResponse,
	isPostByEmailAddress,
	isSimpleWpcomSite,
	normalizeWpcomPostByEmailStatus,
} from './utils';
import type {
	SitePostByEmailAction,
	SitePostByEmailSettings,
	SitePostByEmailStatus,
} from './types';
import type { Site } from '../site/types';

function normalizeWpcomPostByEmailMutationResponse(
	action: SitePostByEmailAction,
	response: unknown
): SitePostByEmailSettings {
	if ( action === 'delete' ) {
		return { post_by_email_address: undefined };
	}

	if ( response && typeof response === 'object' && 'email' in response ) {
		const { email } = response as SitePostByEmailStatus;
		return {
			post_by_email_address: isPostByEmailAddress( email ) ? email : undefined,
		};
	}

	return normalizeWpcomPostByEmailStatus( response as SitePostByEmailStatus );
}

export async function updateSitePostByEmailSettings(
	site: Pick< Site, 'ID' | 'jetpack' | 'is_wpcom_atomic' >,
	action: SitePostByEmailAction
): Promise< SitePostByEmailSettings > {
	if ( ! isSimpleWpcomSite( site ) ) {
		const response = await updateJetpackSettings( site.ID, {
			post_by_email_address: action,
		} );

		return action === 'delete'
			? { post_by_email_address: undefined }
			: getSettingsFromJetpackResponse( response );
	}

	const path = `/sites/${ site.ID }/post-by-email`;

	if ( action === 'delete' ) {
		await wpcom.req.post( {
			method: 'DELETE',
			path,
			apiNamespace: 'wpcom/v2',
		} );

		return { post_by_email_address: undefined };
	}

	const response =
		action === 'regenerate'
			? await wpcom.req.put( { method: 'PUT', path, apiNamespace: 'wpcom/v2' } )
			: await wpcom.req.post( { path, apiNamespace: 'wpcom/v2' } );

	return normalizeWpcomPostByEmailMutationResponse( action, response );
}
