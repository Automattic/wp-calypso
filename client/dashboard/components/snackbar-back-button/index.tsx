import { useRouter, useCanGoBack } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { ReactNode } from 'react';

import './style.scss';

export function getSnackbarBackButtonText(
	to: 'site-overview' | 'site-domains' | 'site-deployments' | 'site-settings-sftp-ssh'
) {
	switch ( to ) {
		case 'site-overview':
			return __( 'Back to Site Overview' );
		case 'site-deployments':
			return __( 'Back to Site Deployments' );
		case 'site-domains':
			return __( 'Back to Site Domain Names' );
		case 'site-settings-sftp-ssh':
			return __( 'Back to SFTP/SSH settings' );
		default:
			return null;
	}
}

export default function SnackbarBackButton( { children }: { children: ReactNode } ) {
	const router = useRouter();
	const canGoBack = useCanGoBack();

	if ( ! canGoBack ) {
		return null;
	}

	return (
		<div
			className="dashboard-snackbar-back-button"
			style={ {
				position: 'fixed',
				bottom: '16px',
				insetInlineStart: '16px',
				zIndex: 3,
			} }
		>
			<Button
				variant="primary"
				icon={ isRTL() ? chevronRight : chevronLeft }
				iconPosition="left"
				onClick={ () => router.history.back() }
			>
				{ children }
			</Button>
		</div>
	);
}
