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
import { a4aLink } from '../../../utils/link';
import AssignLicenseModal from './assign-license-modal';
import {
	LICENSE_STATUS_FILTERS,
	getLicenseDisplayStatus,
	getLicenseStatus,
	getLicenseProductName,
	getLicenseStatusLabels,
	getLicenseTags,
	getSiteHostname,
	isAutoRenewDisabled,
	isBundleParent,
	isChildLicense,
	isJetpackCrmLicense,
	isPartnerLicense,
	isPressableAddonLicense,
	isPressableLicense,
	isWpcomHostingLicense,
} from './license-status';
import RevokeLicenseModal from './revoke-license-modal';
import LicenseStatusBadge from './status-badge';
import type { LicenseStatus } from './license-status';
import type { FetchJetpackLicensesPageOptions, JetpackLicense } from '@automattic/api-core';
import type { Action, Field, View } from '@wordpress/dataviews';

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

export function getLicenseActions( {
	canRevoke,
	isAgencyOwner,
	onCopyKey,
	onDownload,
	onOpenSites,
	onOpenHosting,
	recordTracksEvent,
}: {
	canRevoke: boolean;
	isAgencyOwner: boolean;
	onCopyKey: ( license: JetpackLicense ) => void;
	onDownload: ( license: JetpackLicense ) => void;
	onOpenSites: () => void;
	onOpenHosting: ( license: JetpackLicense ) => void;
	recordTracksEvent: ( eventName: string ) => void;
} ): Action< JetpackLicense >[] {
	// Only the agency owner can act on Pressable licenses.
	const canAct = ( item: JetpackLicense ) => isAgencyOwner || ! isPressableLicense( item );
	const isAssignable = ( item: JetpackLicense ) =>
		canAct( item ) &&
		isPartnerLicense( item ) &&
		getLicenseStatus( item ) === 'unassigned' &&
		! isBundleParent( item ) &&
		! isPressableAddonLicense( item );
	const isAssigned = ( item: JetpackLicense ) =>
		canAct( item ) && getLicenseStatus( item ) === 'assigned' && !! item.siteurl;
	// Site management actions only apply to sites created from a WordPress.com hosting license.
	const isAssignedWpcomSite = ( item: JetpackLicense ) =>
		isAssigned( item ) && isWpcomHostingLicense( item );
	const isDevSite = ( item: JetpackLicense ) => item.meta?.a4a_is_dev_site === '1';
	const openExternal = ( url: string ) => window.open( url, '_blank', 'noopener,noreferrer' );

	// The site actions mirror the classic license row. Set up site, Change domain,
	// Hosting configuration, and Prepare for launch go to the Sites list for now.
	// TODO: point each at its own screen once site details and settings land in
	// MSD (A4A-3021).
	return [
		{
			id: 'set-up-site',
			label: __( 'Set up site' ),
			isEligible: isAssignedWpcomSite,
			callback: () => {
				recordTracksEvent( 'calypso_a4a_licenses_site_set_up_click' );
				onOpenSites();
			},
		},
		{
			id: 'change-domain',
			label: __( 'Change domain' ),
			isEligible: ( item ) => isAssignedWpcomSite( item ) && ! isDevSite( item ),
			callback: () => {
				recordTracksEvent( 'calypso_a4a_licenses_change_domain_click' );
				onOpenSites();
			},
		},
		{
			id: 'hosting-configuration',
			label: __( 'Hosting configuration' ),
			isEligible: isAssignedWpcomSite,
			callback: () => {
				recordTracksEvent( 'calypso_a4a_licenses_hosting_configuration_click' );
				onOpenSites();
			},
		},
		{
			id: 'edit-site-in-wp-admin',
			label: __( 'Edit site in WP Admin' ),
			isEligible: isAssignedWpcomSite,
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_edit_site_click' );
				openExternal( `${ items[ 0 ].siteurl }/wp-admin/admin.php?page=jetpack#/dashboard` );
			},
		},
		{
			id: 'debug-site',
			label: __( 'Debug site' ),
			isEligible: ( item ) => isAssigned( item ) && ! isPressableLicense( item ),
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_debug_site_click' );
				openExternal( `https://jptools.wordpress.com/debug/?url=${ items[ 0 ].siteurl }` );
			},
		},
		{
			id: 'upgrade',
			label: __( 'Upgrade' ),
			isEligible: ( item ) =>
				canAct( item ) &&
				( isWpcomHostingLicense( item ) || isPressableLicense( item ) ) &&
				! isPressableAddonLicense( item ) &&
				getLicenseStatus( item ) !== 'revoked' &&
				! isDevSite( item ) &&
				! item.referral &&
				! isAutoRenewDisabled( item ),
			callback: ( items ) => {
				recordTracksEvent( 'calypso_a4a_licenses_upgrade_click' );
				onOpenHosting( items[ 0 ] );
			},
		},
		{
			id: 'prepare-for-launch',
			label: __( 'Prepare for launch' ),
			// TODO: classic checks WP Admin access first and shows a permission modal
			// when the user cannot launch the site.
			isEligible: ( item ) => isAssignedWpcomSite( item ) && isDevSite( item ),
			callback: () => {
				recordTracksEvent( 'calypso_a4a_licenses_prepare_for_launch_click' );
				onOpenSites();
			},
		},
		{
			id: 'create-site',
			label: __( 'Create site' ),
			isEligible: ( item ) => isAssignable( item ) && isWpcomHostingLicense( item ),
			// The site setup flow still lives in the classic dashboard.
			callback: () => window.location.assign( a4aLink( '/sites/need-setup' ) ),
		},
		{
			id: 'assign-license',
			label: __( 'Assign to site' ),
			isEligible: ( item ) => isAssignable( item ) && ! isWpcomHostingLicense( item ),
			modalHeader: __( 'Which site would you like to assign this license to?' ),
			modalSize: 'medium',
			RenderModal: ( { items, closeModal } ) => (
				<AssignLicenseModal license={ items[ 0 ] } closeModal={ closeModal } />
			),
		},
		{
			id: 'copy-license-key',
			label: __( 'Copy license key' ),
			// Classic never exposes the key of a Pressable license.
			isEligible: ( item ) => canAct( item ) && ! isPressableLicense( item ),
			callback: ( items ) => onCopyKey( items[ 0 ] ),
		},
		{
			id: 'download-license-product',
			label: __( 'Download product' ),
			isEligible: ( item ) =>
				canAct( item ) &&
				isPartnerLicense( item ) &&
				item.has_downloads &&
				getLicenseStatus( item ) !== 'revoked',
			callback: ( items ) => onDownload( items[ 0 ] ),
		},
		{
			id: 'download-crm-extensions',
			label: __( 'Download Jetpack CRM Extensions' ),
			isEligible: ( item ) =>
				canAct( item ) && isJetpackCrmLicense( item ) && getLicenseStatus( item ) === 'assigned',
			// The CRM downloads page still lives in the classic dashboard.
			callback: ( items ) =>
				window.location.assign( a4aLink( `/purchases/crm-downloads/${ items[ 0 ].license_key }` ) ),
		},
		{
			id: 'revoke-license',
			label: __( 'Revoke license' ),
			// Referral licenses are paid for by the client, so the agency cannot revoke them.
			isEligible: ( item ) =>
				canAct( item ) &&
				canRevoke &&
				isPartnerLicense( item ) &&
				! item.referral &&
				! isAutoRenewDisabled( item ) &&
				( isChildLicense( item )
					? getLicenseStatus( item ) === 'assigned'
					: getLicenseStatus( item ) !== 'revoked' ),
			modalHeader: ( items ) =>
				isBundleParent( items[ 0 ] )
					? sprintf(
							/* translators: %1$d is the number of licenses in the bundle, %2$s is the product name. */
							__( 'Revoke bundle of %1$d %2$s licenses?' ),
							items[ 0 ].quantity ?? 0,
							getLicenseProductName( items[ 0 ] )
					  )
					: sprintf(
							/* translators: %s is the product name. */
							__( 'Revoke %s license?' ),
							getLicenseProductName( items[ 0 ] )
					  ),
			RenderModal: ( { items, closeModal } ) => (
				<RevokeLicenseModal license={ items[ 0 ] } closeModal={ closeModal } />
			),
		},
	];
}
