import {
	JetpackLicenseFilter,
	JetpackLicenseSortDirection,
	JetpackLicenseSortField,
} from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { DEFAULT_PER_PAGE } from '../../../sites/dataviews/views';
import { formatDate, parseDateAsUTC } from '../../../utils/datetime';
import {
	LICENSE_STATUS_FILTERS,
	getLicenseDisplayStatus,
	getLicenseStatus,
	getLicenseProductName,
	getLicenseStatusLabels,
	getLicenseTags,
	getSiteHostname,
	isBundleParent,
	isLicenseStatus,
	isPressableLicense,
	isRecentlyTransferred,
} from './license-status';
import LicenseStatusBadge from './status-badge';
import TransferredBadge from './transferred-badge';
import type { LicenseStatus } from './license-status';
import type { FetchJetpackLicensesPageOptions, JetpackLicense } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: DEFAULT_PER_PAGE,
	page: 1,
	titleField: 'product',
	fields: [ 'status', 'site', 'issued_at', 'cost' ],
	sort: { field: 'issued_at', direction: 'desc' },
};

// The endpoint only sorts by these date fields.
const SORTABLE_FIELDS = [
	JetpackLicenseSortField.IssuedAt,
	JetpackLicenseSortField.AttachedAt,
	JetpackLicenseSortField.RevokedAt,
];

export function toFetchOptions( view: View ): FetchJetpackLicensesPageOptions {
	// The endpoint takes one status, so the field is single-select. A view
	// persisted while it was multi-select still holds an array.
	const rawStatus = view.filters?.find( ( filter ) => filter.field === 'status' )?.value;
	const status = Array.isArray( rawStatus ) ? rawStatus[ 0 ] : rawStatus;
	const sortField = SORTABLE_FIELDS.find( ( field ) => field === view.sort?.field );

	return {
		filter: isLicenseStatus( status )
			? LICENSE_STATUS_FILTERS[ status ]
			: JetpackLicenseFilter.NotRevoked,
		search: view.search || undefined,
		sortField: sortField ?? SORTABLE_FIELDS[ 0 ],
		sortDirection:
			view.sort?.direction === 'asc'
				? JetpackLicenseSortDirection.Ascending
				: JetpackLicenseSortDirection.Descending,
		page: view.page,
		perPage: view.perPage,
	};
}

export const getLicenseId = ( license: JetpackLicense ) => String( license.license_id );

const PRESSABLE_AGENCY_URL = 'https://my.pressable.com/agency/auth';

function SiteCell( {
	license,
	isAgencyOwner,
	isProvisioning,
}: {
	license: JetpackLicense;
	isAgencyOwner: boolean;
	isProvisioning: boolean;
} ) {
	if ( isPressableLicense( license ) && ! license.revoked_at ) {
		return isAgencyOwner ? (
			<ExternalLink href={ PRESSABLE_AGENCY_URL }>{ __( 'Manage in Pressable' ) }</ExternalLink>
		) : (
			<Text variant="muted">{ __( 'Managed by agency owner' ) }</Text>
		);
	}
	if ( isBundleParent( license ) ) {
		return <Text variant="muted">—</Text>;
	}
	if ( ! license.siteurl ) {
		return (
			<Text variant="muted">
				{ isProvisioning ? __( 'Being created…' ) : __( 'Not assigned' ) }
			</Text>
		);
	}
	return (
		<ExternalLink href={ license.siteurl }>{ getSiteHostname( license.siteurl ) }</ExternalLink>
	);
}

function CostCell( { license }: { license: JetpackLicense } ) {
	const subscription = license.subscription;
	const amount = Number( subscription?.purchase_price );
	if ( ! subscription || ! amount ) {
		return <Text variant="muted">—</Text>;
	}

	const formatted = formatCurrency( amount, subscription.purchase_currency );
	return (
		<Text>
			{ subscription.billing_interval_unit === 'year'
				? /* translators: %s is a price, e.g. $47.95 */
					sprintf( __( '%s/year' ), formatted )
				: /* translators: %s is a price, e.g. $47.95 */
					sprintf( __( '%s/month' ), formatted ) }
		</Text>
	);
}

function ProductCell( { license, locale }: { license: JetpackLicense; locale: string } ) {
	const transferredUntil = license.meta?.a4a_transferred_subscription_expiration;
	const clientEmail = license.referral?.client?.email;
	return (
		<VStack spacing={ 0 }>
			<HStack justify="flex-start" spacing={ 2 } expanded={ false } wrap>
				<Text weight={ 500 }>{ getLicenseProductName( license ) }</Text>
				{ isBundleParent( license ) && <Text variant="muted">×{ license.quantity }</Text> }
				{ getLicenseTags( license ).map( ( tag ) => (
					<Badge key={ tag }>{ tag }</Badge>
				) ) }
				{ transferredUntil && isRecentlyTransferred( license ) && (
					<TransferredBadge billedFrom={ transferredUntil } locale={ locale } />
				) }
			</HStack>
			{ clientEmail && (
				<Text variant="muted" title={ clientEmail }>
					{ createInterpolateElement(
						/* translators: %s is the client's email address. */
						sprintf( __( '<email>%s</email> owns this' ), clientEmail ),
						{ email: <strong /> }
					) }
				</Text>
			) }
		</VStack>
	);
}

export function getLicenseFields( {
	locale,
	isAgencyOwner,
	provisioningLicenseKeys,
}: {
	locale: string;
	isAgencyOwner: boolean;
	provisioningLicenseKeys: Set< string >;
} ): Field< JetpackLicense >[] {
	const statusLabels = getLicenseStatusLabels();
	const renderDate = ( value: string | null ) => (
		<Text>{ value ? formatDate( parseDateAsUTC( value ), locale ) : '—' }</Text>
	);

	return [
		{
			id: 'product',
			label: __( 'Product' ),
			type: 'text',
			filterBy: false,
			enableGlobalSearch: true,
			enableSorting: false,
			enableHiding: false,
			getValue: ( { item } ) => getLicenseProductName( item ),
			render: ( { item } ) => <ProductCell license={ item } locale={ locale } />,
		},
		{
			id: 'status',
			label: __( 'Status' ),
			type: 'text',
			enableSorting: false,
			enableHiding: false,
			elements: ( Object.keys( statusLabels ) as LicenseStatus[] ).map( ( value ) => ( {
				value,
				label: statusLabels[ value ],
			} ) ),
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => getLicenseStatus( item ),
			render: ( { item } ) => {
				const status = getLicenseDisplayStatus( item );
				return status ? <LicenseStatusBadge status={ status } /> : <Text variant="muted">—</Text>;
			},
		},
		{
			id: 'site',
			label: __( 'Site' ),
			type: 'text',
			filterBy: false,
			enableSorting: false,
			getValue: ( { item } ) => item.siteurl ?? '',
			render: ( { item } ) => (
				<SiteCell
					license={ item }
					isAgencyOwner={ isAgencyOwner }
					isProvisioning={ provisioningLicenseKeys.has( item.license_key ) }
				/>
			),
		},
		{
			id: 'issued_at',
			label: __( 'Issued' ),
			type: 'datetime',
			filterBy: false,
			enableSorting: true,
			getValue: ( { item } ) => item.issued_at,
			render: ( { item } ) => renderDate( item.issued_at ),
		},
		{
			id: 'attached_at',
			label: __( 'Assigned on' ),
			type: 'datetime',
			filterBy: false,
			enableSorting: true,
			getValue: ( { item } ) => item.attached_at ?? '',
			render: ( { item } ) => renderDate( item.attached_at ),
		},
		{
			id: 'revoked_at',
			label: __( 'Revoked on' ),
			type: 'datetime',
			filterBy: false,
			enableSorting: true,
			getValue: ( { item } ) => item.revoked_at ?? '',
			render: ( { item } ) => renderDate( item.revoked_at ),
		},
		{
			id: 'cost',
			label: __( 'Cost' ),
			type: 'text',
			filterBy: false,
			enableSorting: false,
			getValue: ( { item } ) => String( item.subscription?.purchase_price ?? '' ),
			render: ( { item } ) => <CostCell license={ item } />,
		},
	];
}
