import { Badge } from '@wordpress/ui';
import { getLicenseStatusLabels } from './license-status';
import type { LicenseStatus } from './license-status';
import type { ComponentProps } from 'react';

type BadgeIntent = ComponentProps< typeof Badge >[ 'intent' ];

const STATUS_INTENT: Record< LicenseStatus, BadgeIntent > = {
	assigned: 'stable',
	unassigned: 'medium',
	revoked: 'high',
};

export default function LicenseStatusBadge( { status }: { status: LicenseStatus } ) {
	return <Badge intent={ STATUS_INTENT[ status ] }>{ getLicenseStatusLabels()[ status ] }</Badge>;
}
