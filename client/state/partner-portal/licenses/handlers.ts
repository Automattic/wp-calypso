import { translate } from 'i18n-calypso';
import { AnyAction } from 'redux';
import {
	JETPACK_PARTNER_PORTAL_LICENSES_REQUEST,
	JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST,
} from 'calypso/state/action-types';
import { http as coreHttp } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest as vanillaDispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { NoticeAction } from 'calypso/state/notices/types';
import {
	receiveLicenseCounts,
	receiveLicenses,
} from 'calypso/state/partner-portal/licenses/actions';
import {
	DispatchRequest,
	HttpAction,
	License,
	LicenseCounts,
	PaginatedItems,
} from 'calypso/state/partner-portal/types';
import type { ReferralAPIResponse } from 'calypso/a8c-for-agencies/sections/referrals/types';

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
	has_downloads: boolean;
	issued_at: string;
	attached_at: string | null;
	revoked_at: string | null;
	owner_type: string | null;
	quantity: number | null;
	parent_license_id: number | null;
	referral: ReferralAPIResponse | null;
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

function http( options: any, action: HttpAction ): AnyAction {
	return coreHttp(
		{
			...options,
			options: {
				fetcher: action.fetcher,
				...( options.options || {} ),
			},
		},
		action
	) as AnyAction;
}

export function fetchLicensesHandler( action: HttpAction ): AnyAction {
	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses',
			query: {
				// Do not apply filters during search as search takes over (matches Calypso Blue Post search behavior).
				...( action.search
					? { search: action.search }
					: { filter: action.filter, page: action.page } ),
				sort_field: action.sortField,
				sort_direction: action.sortDirection,
				per_page: action.perPage,
			},
		},
		action
	) as AnyAction;
}

export function receiveLicensesHandler(
	action: AnyAction,
	paginatedLicenses: PaginatedItems< License >
) {
	return receiveLicenses( paginatedLicenses );
}

export function receiveLicensesErrorHandler(): NoticeAction {
	return errorNotice( translate( 'Failed to retrieve your licenses. Please try again later.' ) );
}

export function formatLicenses( items: APILicense[] ): License[] {
	return items.map( ( item ) => ( {
		licenseId: item.license_id,
		licenseKey: item.license_key,
		product: item.product,
		productId: item.product_id,
		userId: item.user_id,
		username: item.username,
		blogId: item.blog_id,
		siteUrl: item.siteurl,
		hasDownloads: item.has_downloads,
		issuedAt: item.issued_at,
		attachedAt: item.attached_at,
		revokedAt: item.revoked_at,
		ownerType: item.owner_type,
		quantity: item.quantity,
		parentLicenseId: item.parent_license_id,
		referral: item.referral,
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

export function fetchLicenseCountsHandler( action: HttpAction ): AnyAction {
	return http(
		{
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/licenses/counts',
		},
		action
	) as AnyAction;
}

export function receiveLicenseCountsHandler( action: AnyAction, counts: LicenseCounts ) {
	return receiveLicenseCounts( counts );
}

// Avoid TypeScript warnings and be explicit about the type of dispatchRequest being mostly unknown.
const dispatchRequest = vanillaDispatchRequest as DispatchRequest;

export default {
	[ JETPACK_PARTNER_PORTAL_LICENSES_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchLicensesHandler,
			onSuccess: receiveLicensesHandler,
			onError: receiveLicensesErrorHandler,
			fromApi: ( paginatedItems: APIPaginatedItems< APILicense > ) =>
				formatPaginatedItems( formatLicenses, paginatedItems ),
		} ),
	],
	[ JETPACK_PARTNER_PORTAL_LICENSE_COUNTS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchLicenseCountsHandler,
			onSuccess: receiveLicenseCountsHandler,
			onError: () => {
				// Failure of low importance we can ignore.
			},
		} ),
	],
};
