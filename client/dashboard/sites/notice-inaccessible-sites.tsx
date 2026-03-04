import { allSitesQuery, userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import Notice from '../components/notice';
import { isDotcomPlan } from '../utils/purchase';
import type { Purchase } from '@automattic/api-core';

function isDisconnectedSite( purchase: Purchase, siteIds: Set< number > ): boolean {
	return isDotcomPlan( purchase ) && ! siteIds.has( purchase.blog_id );
}

export default function InaccessibleSitesNotice() {
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const { data: sites } = useQuery( allSitesQuery() );

	const inaccessibleSiteSlugs = useMemo( () => {
		if ( ! purchases || ! sites ) {
			return [];
		}

		const siteIds = new Set( sites.map( ( site ) => site.ID ) );
		const inaccessibleSiteSlugs = new Set< string >();

		for ( const purchase of purchases ) {
			if ( isDisconnectedSite( purchase, siteIds ) ) {
				inaccessibleSiteSlugs.add( purchase.site_slug );
			}
		}

		return [ ...inaccessibleSiteSlugs ];
	}, [ purchases, sites ] );

	if ( inaccessibleSiteSlugs.length === 0 ) {
		return null;
	}

	return (
		<Notice variant="error" title={ __( 'You have inaccessible sites' ) }>
			<p>
				{ __( 'You no longer have access to the following sites. Please review and take action.' ) }
			</p>

			<ul>
				{ inaccessibleSiteSlugs.map( ( slug ) => (
					<li key={ slug }>
						<Link to={ `/sites/${ slug }` }>{ slug }</Link>
					</li>
				) ) }
			</ul>
		</Notice>
	);
}
