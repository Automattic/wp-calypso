import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';
import type { LicenseStatus } from './mock-data';
import type { ComponentProps } from 'react';

type BadgeIntent = ComponentProps< typeof Badge >[ 'intent' ];

const STATUS_INTENT: Record< LicenseStatus, BadgeIntent > = {
	assigned: 'success',
	unassigned: 'warning',
	revoked: 'error',
};

const STATUS_TEXT: Record< LicenseStatus, string > = {
	assigned: __( 'Assigned' ),
	unassigned: __( 'Unassigned' ),
	revoked: __( 'Revoked' ),
};

export function PurchasesStatusBadge( { status }: { status: LicenseStatus } ) {
	return <Badge intent={ STATUS_INTENT[ status ] }>{ STATUS_TEXT[ status ] }</Badge>;
}
