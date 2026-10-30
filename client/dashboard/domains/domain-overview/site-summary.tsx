import { Domain, DomainSubtype } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function DomainSiteSettingsSummary( { domain }: { domain: Domain } ) {
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	const shouldShowAttachSite =
		domain.is_domain_only_site &&
		! domain.is_gravatar_restricted_domain &&
		domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER &&
		domain.can_transfer_to_other_site;

	if ( shouldShowAttachSite ) {
		return (
			<RouterLinkSummaryButton
				to={ `/domains/${ domain.domain }/transfer/other-site` }
				title={ __( 'Site' ) }
				badges={ [ { text: __( 'No site attached' ) } ] }
				density="medium"
			/>
		);
	}

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site?.slug ?? domain.site_slug }` }
			title={ __( 'Site' ) }
			badges={ site ? [ { text: site.name } ] : [] }
			density="medium"
		/>
	);
}
