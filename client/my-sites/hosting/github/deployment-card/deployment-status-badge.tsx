import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
<<<<<<< HEAD
import type { BadgeType } from '@automattic/components';
=======
import type { BadgeProps } from '@automattic/components';
>>>>>>> 7e2b101506b (Fix type errors)

interface DeploymentStatusBadgeProps {
	status: string;
	totalFailures: number;
}

export const DeploymentStatusBadge = ( { status, totalFailures }: DeploymentStatusBadgeProps ) => {
	const translate = useTranslate();

<<<<<<< HEAD
	const { type, message } = useMemo< { type: BadgeType; message: string } >( () => {
=======
	const { type, message } = useMemo< { type: BadgeProps[ 'type' ]; message: string } >( () => {
>>>>>>> 7e2b101506b (Fix type errors)
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
