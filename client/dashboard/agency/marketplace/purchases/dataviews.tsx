import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalHStack as HStack, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import { formatDate } from '../../../utils/datetime';
import AssignLicenseModal from './assign-modal';
import { PurchasesStatusBadge } from './status-badge';
import type { AgencyLicense, AgencySite, LicenseStatus } from './mock-data';
import type { Action, Field, SortDirection, View } from '@wordpress/dataviews';

export type PurchasesActionHandlers = {
	onNotice: ( message: string ) => void;
	onAssign: ( licenseId: number, site: AgencySite ) => void;
	sites: AgencySite[];
};

export const STATUS_LABELS: Record< LicenseStatus, string > = {
	assigned: __( 'Assigned' ),
	unassigned: __( 'Unassigned' ),
	revoked: __( 'Revoked' ),
};

export const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 10,
	page: 1,
	titleField: 'product',
	showTitle: true,
	fields: [ 'status', 'site', 'issuedAt', 'cost' ],
	sort: {
		field: 'issuedAt',
		direction: 'desc' as SortDirection,
	},
	layout: {
		density: 'balanced',
	},
};

function SiteCell( { license }: { license: AgencyLicense } ) {
	if ( ! license.siteUrl ) {
		return <span className="marketplace-purchases__muted">{ __( 'Not assigned' ) }</span>;
	}
	return (
		<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
			<ExternalLink href={ `https://${ license.siteUrl }` }>{ license.siteUrl }</ExternalLink>
		</HStack>
	);
}

function formatIssuedDate( value: string | null, locale: string ): string {
	if ( ! value ) {
		return '—';
	}
	return formatDate( new Date( value ), locale ) || '—';
}

export function getFields( { locale }: { locale: string } ): Field< AgencyLicense >[] {
	return [
		{
			id: 'product',
			label: __( 'Product' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: AgencyLicense } ) =>
				`${ item.product } ${ item.siteUrl ?? '' } ${ item.licenseKey }`,
			render: ( { item }: { item: AgencyLicense } ) => (
				<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
					<span className="marketplace-purchases__product-name">{ item.product }</span>
					{ item.quantity > 1 && (
						<span className="marketplace-purchases__quantity">×{ item.quantity }</span>
					) }
				</HStack>
			),
		},
		{
			id: 'status',
			label: __( 'Status' ),
			type: 'text',
			enableSorting: true,
			enableHiding: false,
			elements: ( Object.keys( STATUS_LABELS ) as LicenseStatus[] ).map( ( value ) => ( {
				value,
				label: STATUS_LABELS[ value ],
			} ) ),
			filterBy: { operators: [ 'isAny' ] },
			getValue: ( { item }: { item: AgencyLicense } ) => item.status,
			render: ( { item }: { item: AgencyLicense } ) => (
				<PurchasesStatusBadge status={ item.status } />
			),
		},
		{
			id: 'site',
			label: __( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			getValue: ( { item }: { item: AgencyLicense } ) => item.siteUrl ?? '',
			render: ( { item }: { item: AgencyLicense } ) => <SiteCell license={ item } />,
		},
		{
			id: 'issuedAt',
			label: __( 'Issued' ),
			type: 'datetime',
			enableSorting: true,
			getValue: ( { item }: { item: AgencyLicense } ) => item.issuedAt,
			render: ( { item }: { item: AgencyLicense } ) => (
				<span>{ formatIssuedDate( item.issuedAt, locale ) }</span>
			),
		},
		{
			id: 'assignedAt',
			label: __( 'Assigned' ),
			type: 'datetime',
			enableSorting: true,
			getValue: ( { item }: { item: AgencyLicense } ) => item.attachedAt ?? '',
			render: ( { item }: { item: AgencyLicense } ) => (
				<span>{ formatIssuedDate( item.attachedAt, locale ) }</span>
			),
		},
		{
			id: 'cost',
			label: __( 'Cost' ),
			type: 'text',
			enableSorting: true,
			getValue: ( { item }: { item: AgencyLicense } ) => item.subscription?.purchasePrice ?? 0,
			render: ( { item }: { item: AgencyLicense } ) => {
				if ( ! item.subscription ) {
					return <span>—</span>;
				}
				const amount = formatCurrency(
					item.subscription.purchasePrice,
					item.subscription.purchaseCurrency,
					{ isSmallestUnit: true }
				);
				const suffix =
					item.subscription.billingIntervalUnit === 'year' ? __( '/year' ) : __( '/month' );
				return (
					<span title={ __( 'Mock pricing' ) }>
						{ amount }
						<span className="marketplace-purchases__muted">{ suffix }</span>
					</span>
				);
			},
		},
	];
}

export const getItemId = ( license: AgencyLicense ) => String( license.licenseId );

export function getActions( {
	onNotice,
	onAssign,
	sites,
}: PurchasesActionHandlers ): Action< AgencyLicense >[] {
	return [
		{
			id: 'assign',
			label: __( 'Assign to site' ),
			isPrimary: true,
			icon: globe,
			isEligible: ( item ) => item.status === 'unassigned',
			modalHeader: __( 'Which site would you like to assign this license to?' ),
			RenderModal: ( { items, closeModal } ) => (
				<AssignLicenseModal
					sites={ sites }
					onAssign={ ( site ) => {
						onAssign( items[ 0 ].licenseId, site );
						closeModal?.();
					} }
					onCancel={ () => closeModal?.() }
				/>
			),
		},
		{
			id: 'copy-key',
			label: __( 'Copy license key' ),
			callback: ( items ) => {
				const key = items[ 0 ].licenseKey;
				if ( typeof navigator !== 'undefined' && navigator.clipboard ) {
					navigator.clipboard.writeText( key );
				}
				onNotice( __( 'License key copied to clipboard.' ) );
			},
		},
		{
			id: 'download',
			label: __( 'Download product' ),
			isEligible: ( item ) => item.hasDownloads && item.status !== 'revoked',
			callback: () => {
				onNotice( __( 'Downloads are not available in this prototype.' ) );
			},
		},
		{
			id: 'revoke',
			label: __( 'Revoke license' ),
			isEligible: ( item ) => item.status !== 'revoked',
			callback: ( items ) => {
				onNotice(
					/* translators: %s: product name */
					__( 'Revoking is not available in this prototype.' ) + ` (${ items[ 0 ].product })`
				);
			},
		},
	];
}
