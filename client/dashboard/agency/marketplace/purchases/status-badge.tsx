import { Badge } from '@wordpress/ui';
import { getLicenseDisplayStatusLabels } from './license-status';
import type { LicenseDisplayStatus } from './license-status';
import type { ComponentProps } from 'react';

type BadgeIntent = ComponentProps< typeof Badge >[ 'intent' ];

const STATUS_INTENT: Record< LicenseDisplayStatus, BadgeIntent > = {
	assigned: 'stable',
	active: 'stable',
	unassigned: 'medium',
	revoked: 'high',
};

export default function LicenseStatusBadge( { status }: { status: LicenseDisplayStatus } ) {
	return (
		<Badge intent={ STATUS_INTENT[ status ] }>{ getLicenseDisplayStatusLabels()[ status ] }</Badge>
	);
}
