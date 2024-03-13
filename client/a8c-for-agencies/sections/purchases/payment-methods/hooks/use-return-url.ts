import page from '@automattic/calypso-router';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';
import { A4A_PURCHASES_LINK } from '../../../../components/sidebar-menu/lib/constants';

type Props = {
	redirect: boolean;
};

export function useReturnUrl( { redirect }: Props ) {
	useEffect( () => {
		if ( redirect ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl =
				returnQuery && returnQuery.startsWith( A4A_PURCHASES_LINK )
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
