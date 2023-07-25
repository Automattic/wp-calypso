import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import type { BadgeType } from '@automattic/components';

interface DeploymentStatusBadgeProps {
	status: string;
	totalFailures: number;
}

export const DeploymentStatusBadge = ( { status, totalFailures }: DeploymentStatusBadgeProps ) => {
	const translate = useTranslate();

	const { type, message } = useMemo< { type: BadgeType; message: string } >( () => {
		if ( status === 'failed' ) {
			return {
				type: 'error',
				message: translate( 'Build failed' ),
			};
		}

		if ( status === 'running' ) {
			return {
				type: 'info-blue',
				message: translate( 'Building' ),
			};
		}

		if ( status === 'success' && totalFailures > 0 ) {
			return {
				type: 'warning',
				message: translate( 'Built with warnings' ),
			};
		}

		return {
			type: 'success',
			message: translate( 'Success' ),
		};
	}, [ status, totalFailures, translate ] );

	return <Badge type={ type }>{ message }</Badge>;
};
