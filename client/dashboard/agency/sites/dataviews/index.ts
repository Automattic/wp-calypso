import { useMemo } from 'react';
import { useFields } from '../../../sites/dataviews';
import { getHostField, getPhpVersionField, getWpVersionField } from './endpoint-fields';
import { toAgencyField } from './hydrate';
import {
	getPreviewField,
	getSiteIconField,
	getSiteNameField,
	getSiteUrlField,
	withoutLaunchNag,
} from './site';
import type { AgencySite, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export { getAgencyActions } from './actions';

export function useAgencyFields( {
	viewType,
	onSiteClick,
}: {
	viewType?: string;
	onSiteClick?: ( site: AgencySite ) => void;
} ): Field< AgencySite >[] {
	const siteFields = useFields( { viewType } );

	return useMemo( () => {
		const siteFieldsById = new Map( siteFields.map( ( field ) => [ field.id, field ] ) );
		const shared = ( id: string, adapt = ( field: Field< Site > ) => field ) => {
			const field = siteFieldsById.get( id );
			return field ? toAgencyField( adapt( field ) ) : null;
		};

		return [
			getSiteNameField( onSiteClick ),
			getSiteUrlField(),
			getSiteIconField( viewType ),
			shared( 'subscribers_count' ),
			shared( 'backup' ),
			shared( 'plan' ),
			shared( 'visibility', withoutLaunchNag ),
			getWpVersionField(),
			getPreviewField(),
			shared( 'last_published' ),
			shared( 'uptime' ),
			shared( 'visitors' ),
			shared( 'views' ),
			shared( 'likes' ),
			getPhpVersionField(),
			shared( 'storage' ),
			getHostField(),
		].filter( ( field ): field is Field< AgencySite > => field !== null );
	}, [ siteFields, viewType, onSiteClick ] );
}
