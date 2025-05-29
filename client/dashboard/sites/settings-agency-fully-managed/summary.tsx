import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { home } from '@wordpress/icons';
import { agencyBlogQuery, siteSettingsQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Site } from '../../data/types';

export default function SettingsAgencyFullyManagedSummary( { site }: { site: Site } ) {
	const { data: siteSettings } = useQuery( siteSettingsQuery( site.slug ) );
	const { data: agencyBlog } = useQuery( {
		...agencyBlogQuery( site.ID ),
		enabled: site.is_wpcom_atomic,
	} );

	const isAgencyDevelopmentSite = site.is_a4a_dev_site;
	if ( ! agencyBlog ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/agency-fully-managed` }
			title={ __( 'Agency settings' ) }
			density="medium"
			decoration={ <Icon icon={ home } /> }
			badges={ [
				{
					text:
						siteSettings?.is_fully_managed_agency_site || isAgencyDevelopmentSite
							? __( 'WordPress.com features disabled' )
							: __( 'WordPress.com features enabled' ),
					intent: 'info' as const,
				},
			] }
		/>
	);
}
