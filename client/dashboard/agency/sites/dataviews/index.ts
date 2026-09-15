import { useMemo } from 'react';
import { useFields } from '../../../sites/dataviews';
import { getHostField, getPhpVersionField, getWpVersionField } from './endpoint-fields';
import { toAgencyField, useHydratedSites } from './hydrate';
import { getPreviewField, getSiteIconField, getSiteNameField, getSiteUrlField } from './site';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export { getAgencyActions } from './actions';

export function useAgencyFields( {
	sites,
	viewType,
	onSiteClick,
}: {
	sites: AgencySite[];
	viewType?: string;
	onSiteClick?: ( site: AgencySite ) => void;
} ): Field< AgencySite >[] {
	const hydratedSites = useHydratedSites( sites );
	const siteFields = useFields( { viewType } );

	return useMemo( () => {
		const siteFieldsById = new Map( siteFields.map( ( field ) => [ field.id, field ] ) );
		const getHydrated = ( item: AgencySite ) => hydratedSites.get( item.blog_id );
		const shared = ( id: string ) => {
			const field = siteFieldsById.get( id );
			return field ? toAgencyField( field, getHydrated ) : null;
		};

		return [
			getSiteNameField( onSiteClick ),
			getSiteUrlField(),
			getSiteIconField( viewType ),
			shared( 'subscribers_count' ),
			shared( 'backup' ),
			shared( 'plan' ),
			shared( 'visibility' ),
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
	}, [ siteFields, hydratedSites, viewType, onSiteClick ] );
}
