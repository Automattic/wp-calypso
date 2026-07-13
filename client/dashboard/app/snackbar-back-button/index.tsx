import {
	useRouter,
	useCanGoBack,
	useNavigate,
	useSearch,
	useRouterState,
} from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useEffect } from 'react';
import { siteDomainsRoute, siteOverviewRoute } from '../router/sites';
import { setTransientQueryParamsAtPathname } from '../transient-query-params';

import './style.scss';

type SnackbarBackTo = 'site-overview' | 'site-domains' | 'site-settings-sftp-ssh';

function getSnackbarBackButtonText( to: SnackbarBackTo | undefined ) {
	switch ( to ) {
		case 'site-overview':
		case 'site-domains':
			return __( 'Back to site' );
		case 'site-settings-sftp-ssh':
			return __( 'Back to SFTP/SSH settings' );
		default:
			return null;
	}
}

function getSnackbarBackButtonNavigateOptions< Params >(
	to: SnackbarBackTo | undefined,
	params: Params | undefined
) {
	if ( ! params ) {
		return null;
	}
	switch ( to ) {
		case 'site-overview':
			return { to: siteOverviewRoute.fullPath, params };
		case 'site-domains':
			return { to: siteDomainsRoute.fullPath, params };
		default:
			return null;
	}
}

export interface SnackbarBackButtonProps {
	/**
	 * When provided, the button navigates to `back_to` explicitly with the params,
	 * instead of going back the browser history.
	 */
	backToParams?: Record< string, string >;
}

export default function SnackbarBackButton( { backToParams }: SnackbarBackButtonProps = {} ) {
	const router = useRouter();
	const navigate = useNavigate();
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

	const text = getSnackbarBackButtonText( backTo );

	if ( ! text || ( ! backToParams && ! canGoBack ) ) {
		return null;
	}

	const handleBack = () => {
		const navigateOptions = getSnackbarBackButtonNavigateOptions( backTo, backToParams );
		if ( navigateOptions ) {
			navigate( navigateOptions as unknown as Parameters< typeof navigate >[ 0 ] );
		} else {
			router.history.back();
		}
	};

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
				onClick={ handleBack }
			>
				{ text }
			</Button>
		</div>
	);
}
