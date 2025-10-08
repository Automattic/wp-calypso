import { Domain, DomainSubtype } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { globe } from '@wordpress/icons';
import OverviewCard from '../../sites/overview-card';
import SiteIcon from '../../sites/site-icon';

interface Props {
	domain: Domain;
}

export default function FeaturedCardSite( { domain }: Props ) {
	const { data: site } = useSuspenseQuery( siteByIdQuery( domain.blog_id ) );

	if ( ! site ) {
		return null;
	}

	const shouldShowAddAttachSite =
		domain.is_domain_only_site &&
		! domain.is_gravatar_restricted_domain &&
		domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER;

	return (
		<OverviewCard
			title={ shouldShowAddAttachSite ? __( 'Attach to a site' ) : __( 'Site' ) }
			heading={
				<span style={ { wordBreak: 'break-all' } }>
					{ shouldShowAddAttachSite ? 'No site attached' : site.name }
				</span>
			}
			link={
				shouldShowAddAttachSite
					? `/domains/${ domain.domain }/transfer/other-site`
					: `/sites/${ site.slug }`
			}
			icon={ shouldShowAddAttachSite ? <Icon icon={ globe } /> : <SiteIcon site={ site } /> }
			description={
				shouldShowAddAttachSite ? __( 'Attach to an existing site.' ) : domain.site_slug
			}
		/>
	);
}
