/**
 * External dependencies
 */
import { AnyAction } from 'redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
} from 'calypso/state/action-types';
import { HttpAction, License, PaginatedItems } from 'calypso/state/partner-portal/types';
import { dispatchRequest as vanillaDispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { NoticeAction } from 'calypso/state/notices/types';
import { errorNotice } from 'calypso/state/notices/actions';

// Required for modular state.
import 'calypso/state/partner-portal/init';

interface APILicense {
	license_id: number;
	license_key: string;
	product_id: number;
	product: string;
	user_id: number | null;
	username: string | null;
	blog_id: number | null;
	siteurl: string | null;
	issued_at: string;
	attached_at: string | null;
	revoked_at: string | null;
}

interface APIPaginatedItems< T > {
	current_items: number;
	current_page: number;
	items: T[];
	items_per_page: number;
	total_items: number;
	total_pages: number;
}

interface APIItemFormatter< FormattedType, APIType > {
	( items: APIType[] ): FormattedType[];
}

// Avoid TypeScript warnings and be explicit about the type of dispatchRequest being mostly unknown.
const dispatchRequest = vanillaDispatchRequest as ( options: unknown ) => unknown;

export function fetchLicenses( action: HttpAction ): AnyAction {
	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses',
			options: {
				fetcher: action.fetcher,
			},
		},
		action
	) as AnyAction;
}

export function receiveLicenses(
	action: AnyAction,
	paginatedLicenses: PaginatedItems< License >
): AnyAction {
	return {
		type: JETPACK_PARTNER_PORTAL_LICENSES_RECEIVE,
		paginatedLicenses,
	};
}

export function receiveLicensesError(): NoticeAction {
	return errorNotice( translate( 'Failed to retrieve your licenses. Please try again later.' ) );
}

function formatLicenses( items: APILicense[] ): License[] {
	return items.map( ( item ) => ( {
		licenseId: item.license_id,
		licenseKey: item.license_key,
		product: item.product,
		productId: item.product_id,
		userId: item.user_id,
		username: item.username,
		blogId: item.blog_id,
		siteUrl: item.siteurl,
		issuedAt: item.issued_at,
		attachedAt: item.attached_at,
		revokedAt: item.revoked_at,
	} ) );
}

function formatPaginatedItems< FormattedType, APIType >(
	itemFormatter: APIItemFormatter< FormattedType, APIType >,
	paginatedItems: APIPaginatedItems< APIType >
): PaginatedItems< FormattedType > {
	return {
		currentItems: paginatedItems.current_items,
		currentPage: paginatedItems.current_page,
		items: itemFormatter( paginatedItems.items ),
		itemsPerPage: paginatedItems.items_per_page,
		totalItems: paginatedItems.total_items,
		totalPages: paginatedItems.total_pages,
	};
}

export default {
	[ JETPACK_PARTNER_PORTAL_LICENSES_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchLicenses,
			onSuccess: receiveLicenses,
			onError: receiveLicensesError,
			fromApi: ( paginatedItems: APIPaginatedItems< APILicense > ) =>
				formatPaginatedItems( formatLicenses, paginatedItems ),
		} ),
	],
};
