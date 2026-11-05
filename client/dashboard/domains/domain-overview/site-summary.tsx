import { Domain } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayName } from '../../utils/site-name';

export default function DomainSiteSettingsSummary( {
	domain,
	onClick,
}: {
	domain: Domain;
	onClick?: () => void;
} ) {
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	const shouldShowAttachSite =
		domain.is_domain_only_site &&
		! domain.is_gravatar_restricted_domain &&
		domain.can_transfer_to_other_site;

	let badges: { text: string }[] = [];
	if ( shouldShowAttachSite ) {
		badges = [ { text: __( 'No site attached' ) } ];
	} else if ( site ) {
		badges = [ { text: getSiteDisplayName( site ) } ];
	}

	return (
		<RouterLinkSummaryButton
			to={
				shouldShowAttachSite
					? `/domains/${ domain.domain }/transfer/other-site`
					: `/sites/${ site?.slug ?? domain.site_slug }`
			}
			title={ __( 'Site' ) }
			decoration={
				site && ! shouldShowAttachSite ? <SiteIcon site={ site } size={ 24 } /> : undefined
			}
			badges={ badges }
			density="medium"
			onClick={ onClick }
		/>
	);
}
