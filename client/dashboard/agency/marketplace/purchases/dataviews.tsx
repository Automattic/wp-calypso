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
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { DEFAULT_PER_PAGE } from '../../../sites/dataviews/views';
import { formatDate } from '../../../utils/datetime';
import {
	LICENSE_STATUS_FILTERS,
	getLicenseDisplayStatus,
	getLicenseStatus,
	getLicenseProductName,
	getLicenseStatusLabels,
	getLicenseTags,
	getSiteHostname,
	isBundleParent,
	isPressableLicense,
} from './license-status';
import LicenseStatusBadge from './status-badge';
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
	const status = view.filters?.find( ( filter ) => filter.field === 'status' )?.value as
		| LicenseStatus
		| undefined;
	const sortField = SORTABLE_FIELDS.find( ( field ) => field === view.sort?.field );

	return {
		filter: ( status && LICENSE_STATUS_FILTERS[ status ] ) || JetpackLicenseFilter.NotRevoked,
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
}: {
	license: JetpackLicense;
	isAgencyOwner: boolean;
} ) {
	if ( isPressableLicense( license ) && ! license.revoked_at ) {
		return isAgencyOwner ? (
			<ExternalLink href={ PRESSABLE_AGENCY_URL }>{ __( 'Manage in Pressable' ) }</ExternalLink>
		) : (
			<Text variant="muted">{ __( 'Managed by agency owner' ) }</Text>
		);
	}
	if ( ! license.siteurl ) {
		return <Text variant="muted">{ __( 'Not assigned' ) }</Text>;
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

// TODO: classic shows the referring client's email under the product name. Port
// it once the `referral` field on JetpackLicense is typed.
function ProductCell( { license }: { license: JetpackLicense } ) {
	return (
		<HStack justify="flex-start" spacing={ 2 } expanded={ false } wrap>
			<Text weight={ 500 }>{ getLicenseProductName( license ) }</Text>
			{ isBundleParent( license ) && <Text variant="muted">×{ license.quantity }</Text> }
			{ getLicenseTags( license ).map( ( tag ) => (
				<Badge key={ tag }>{ tag }</Badge>
			) ) }
		</HStack>
	);
}

export function getLicenseFields( {
	locale,
	isAgencyOwner,
}: {
	locale: string;
	isAgencyOwner: boolean;
} ): Field< JetpackLicense >[] {
	const statusLabels = getLicenseStatusLabels();
	const renderDate = ( value: string | null ) => (
		<Text>{ value ? formatDate( new Date( value ), locale ) : '—' }</Text>
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
			render: ( { item } ) => <ProductCell license={ item } />,
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
			render: ( { item } ) => <LicenseStatusBadge status={ getLicenseDisplayStatus( item ) } />,
		},
		{
			id: 'site',
			label: __( 'Site' ),
			type: 'text',
			filterBy: false,
			enableSorting: false,
			getValue: ( { item } ) => item.siteurl ?? '',
			render: ( { item } ) => <SiteCell license={ item } isAgencyOwner={ isAgencyOwner } />,
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
