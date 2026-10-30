import { Domain, DomainSubtype } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { domainTransferToOtherSiteRoute } from '../../app/router/domains';
import { siteRoute } from '../../app/router/sites';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function DomainSiteSettingsSummary( { domain }: { domain: Domain } ) {
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	const shouldShowAttachSite =
		domain.is_domain_only_site &&
		! domain.is_gravatar_restricted_domain &&
		domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER &&
		domain.can_transfer_to_other_site;

	const linkProps = shouldShowAttachSite
		? { to: domainTransferToOtherSiteRoute.fullPath, params: { domainName: domain.domain } }
		: { to: siteRoute.fullPath, params: { siteSlug: site?.slug ?? domain.site_slug } };

	let badges: { text: string }[] = [];
	if ( shouldShowAttachSite ) {
		badges = [ { text: __( 'No site attached' ) } ];
	} else if ( site ) {
		badges = [ { text: site.name } ];
	}

	return (
		<RouterLinkSummaryButton
			{ ...linkProps }
			title={ __( 'Site' ) }
			badges={ badges }
			density="medium"
		/>
	);
}
