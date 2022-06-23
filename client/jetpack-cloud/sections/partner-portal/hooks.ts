import { getQueryArg } from '@wordpress/url';
import page from 'page';
import { useCallback, useEffect, useState } from 'react';
import { useQuery, UseQueryOptions } from 'react-query';
import { ensurePartnerPortalReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
/**
 * Redirect to the partner portal or a present "return" GET parameter given a certain condition.
 *
 * @param {boolean} redirect Whether to execute the redirect.
 * @returns {void}
 */
export function useReturnUrl( redirect: boolean ): void {
	useEffect( () => {
		if ( redirect ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl = ensurePartnerPortalReturnUrl( returnQuery );

			// Avoids redirect attempt if there is no `return` parameter
			if ( ! returnQuery ) {
				return;
			}

			page.redirect( returnUrl );
		}
	}, [ redirect ] );
}

/**
 * Returns the recent payment methods from the Jetpack Stripe account.
 *
 */
export function useRecentPaymentMethodsQuery( { enabled = true }: UseQueryOptions = {} ) {
	return useQuery(
		[ 'jetpack-cloud', 'partner-portal', 'recent-cards' ],
		() =>
			wpcomJpl.req.get( {
				apiNamespace: 'wpcom/v2',
				path: '/jetpack-licensing/stripe/payment-methods',
			} ),
		{
			enabled: enabled,
		}
	);
}

/**
 * Returns false; if flag ever becomes true, then returns true from then onwards.
 *
 * Useful to determine if pagination should be shown based on whether flag is or has been true at some point.
 * For example, Stripe responses include a boolean `has_more` pagination value which you can pass as the
 * argument and use the return value to conditionally render your pagination.
 *
 * @param {boolean} flag
 * @returns {boolean}
 */
export function usePermanentFlag( flag: boolean ): boolean {
	const [ wasTrue, setWasTrue ] = useState( false );

	useEffect( () => {
		if ( flag ) {
			setWasTrue( true );
		}
	}, [ flag ] );

	return wasTrue;
}

/**
 * Handle cursor-based pagination.
 *
 * @todo use this in payment method pagination.
 */
export function useCursorPagination(
	enabled: boolean,
	hasMore: boolean,
	onNavigateCallback: ( page: number, direction: 'next' | 'prev' ) => void
): [ number, boolean, ( page: number ) => void ] {
	const [ page, setPage ] = useState( 1 );
	const showPagination = usePermanentFlag( hasMore );
	const onNavigate = useCallback(
		( newPage: number ) => {
			const direction = newPage > page ? 'next' : 'prev';

			if ( ! enabled ) {
				return;
			}

			if ( newPage < 1 ) {
				return;
			}

			if ( direction === 'next' && ! hasMore ) {
				return;
			}

			setPage( newPage );
			onNavigateCallback?.( newPage, direction );
		},
		[ enabled, hasMore, setPage, onNavigateCallback ]
	);

	return [ page, showPagination, onNavigate ];
}
