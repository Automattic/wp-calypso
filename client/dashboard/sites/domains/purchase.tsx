import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { sprintf, __ } from '@wordpress/i18n';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteDomainsRoute, siteRoute } from '../../app/router/sites';
import DomainSearch from '../../components/domain-search';
import FullScreenOverlay from '../../components/full-screen-overlay';

export default function SiteDomainsPurchase() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const router = useRouter();

	return (
		<FullScreenOverlay
			backLabel={ sprintf(
				// translators: %s is the site name.
				__( 'Back to %s' ),
				site.name
			) }
			fallbackCloseRoute={
				router.buildLocation( {
					to: siteDomainsRoute.fullPath,
					params: {
						siteSlug,
					},
				} ).href
			}
		>
			<DomainSearch currentSiteUrl={ new URL( site.URL ).hostname } />
		</FullScreenOverlay>
	);
}
