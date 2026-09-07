import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import type { LicenseStatus } from './mock-data';
import type { ComponentProps } from 'react';

type BadgeIntent = ComponentProps< typeof Badge >[ 'intent' ];

// @wordpress/ui's Badge (which replaced @automattic/ui's on trunk) speaks in
// severity, not outcome: stable = green, medium = amber, high = red.
const STATUS_INTENT: Record< LicenseStatus, BadgeIntent > = {
	assigned: 'stable',
	unassigned: 'medium',
	revoked: 'high',
};

const STATUS_TEXT: Record< LicenseStatus, string > = {
	assigned: __( 'Assigned' ),
	unassigned: __( 'Unassigned' ),
	revoked: __( 'Revoked' ),
};

export function PurchasesStatusBadge( { status }: { status: LicenseStatus } ) {
	return <Badge intent={ STATUS_INTENT[ status ] }>{ STATUS_TEXT[ status ] }</Badge>;
}
