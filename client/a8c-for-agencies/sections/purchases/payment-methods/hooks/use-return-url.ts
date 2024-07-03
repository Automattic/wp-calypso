import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import {
	A4A_PURCHASES_LINK,
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_SITES_LINK_NEEDS_SETUP,
	A4A_CLIENT_CHECKOUT,
} from '../../../../components/sidebar-menu/lib/constants';

type Props = {
	redirect: boolean;
};

export function useReturnUrl( { redirect }: Props ) {
	useEffect( () => {
		if ( redirect ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl =
				returnQuery &&
				( returnQuery.startsWith( A4A_PURCHASES_LINK ) ||
					returnQuery.startsWith( A4A_MARKETPLACE_CHECKOUT_LINK ) ||
					returnQuery.startsWith( A4A_SITES_LINK_NEEDS_SETUP ) ||
					returnQuery.startsWith( A4A_CLIENT_CHECKOUT ) )
					? returnQuery
					: A4A_PURCHASES_LINK;

			// Avoids redirect attempt if there is no `return` parameter
			if ( ! returnQuery ) {
				return;
			}

			page.redirect( returnUrl );
		}
	}, [ redirect ] );
}
