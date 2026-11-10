import { useRouter, useCanGoBack, useSearch, useRouterState } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useEffect } from 'react';
import { siteDomainsRoute, siteOverviewRoute } from '../router/sites';
import { setTransientQueryParamsAtPathname } from '../transient-query-params';

import './style.scss';

export type SnackbarBackTo = 'site-overview' | 'site-domains' | 'site-settings-sftp-ssh';

export function getSnackbarBackButtonNavigateOptions< Params >(
	to: SnackbarBackTo | undefined,
	params: Params
) {
	switch ( to ) {
		case 'site-overview':
			return { to: siteOverviewRoute.fullPath, params };
		case 'site-domains':
			return { to: siteDomainsRoute.fullPath, params };
		default:
			return null;
	}
}

export default function SnackbarBackButton() {
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const { back_to: backTo } = useSearch( { strict: false } ) as { back_to?: SnackbarBackTo };
	const pathname = useRouterState( { select: ( state ) => state.location.pathname } );

	// Persist `back_to` as a transient query param on the current pathname,
	// which will append the param to the current page's breadcrumb item.
	useEffect( () => {
		setTransientQueryParamsAtPathname(
			pathname.replace( /\/$/, '' ),
			backTo ? { back_to: backTo } : {}
		);
	}, [ pathname, backTo ] );

	if ( backTo !== 'site-settings-sftp-ssh' || ! canGoBack ) {
		return null;
	}

	return (
		<div
			className="dashboard-snackbar-back-button"
			style={ {
				position: 'fixed',
				bottom: '24px',
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
				{ __( 'Back to SFTP/SSH settings' ) }
			</Button>
		</div>
	);
}
