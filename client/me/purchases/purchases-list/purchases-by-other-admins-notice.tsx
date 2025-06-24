import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import type { SiteDetails } from '@automattic/data-stores';

export function PurchasesByOtherAdminsNotice( { sites }: { sites: SiteDetails[] } ) {
	const translate = useTranslate();
	/*
	 * Because this is only rendered when the user has no purchases,
	 * we don't need to check each site to ensure the purchases aren't
	 * linked with the user (they can't be, since they don't have any).
	 */
	const affectedSites = sites
		.filter( ( site ) => {
			if ( ! site?.plan?.is_free ) {
				return site.capabilities.manage_options;
			}
			if ( site?.products && site?.products?.length > 0 ) {
				return site.capabilities.manage_options;
			}
			return false;
		} )
		.map( ( site ) => site.slug );

	if ( ! affectedSites.length ) {
		return;
	}

	let affectedSitesString = '';

	if ( affectedSites.length === 1 ) {
		affectedSitesString = affectedSites[ 0 ];
	} else {
		const allButLast = affectedSites.slice( 0, -1 ).join( ', ' );
		const translatedAnd = translate( 'and', {
			comment: 'last conjunction in a list of blognames: (blog1, blog2,) blog3 _and_ blog4',
		} );
		const last = affectedSites[ affectedSites.length - 1 ];

		affectedSitesString = allButLast + ' ' + translatedAnd + ' ' + last;
	}

	return (
		<Notice status="is-info" showDismiss={ false }>
			{ translate(
				'The upgrades for {{strong}}%(affectedSitesString)s{{/strong}} are owned by another site administrator. ' +
					'These can only be managed by the purchase owners.',
				{
					components: { strong: <strong /> },
					args: {
						affectedSitesString,
					},
				}
			) }
		</Notice>
	);
}
