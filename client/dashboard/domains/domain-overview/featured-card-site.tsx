import { Domain, DomainSubtype } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { layout } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import SiteIcon from '../../components/site-icon';

interface Props {
	domain: Domain;
}

export default function FeaturedCardSite( { domain }: Props ) {
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	if ( ! site ) {
		return <OverviewCard icon={ <Icon icon={ layout } /> } title={ __( 'Site' ) } isLoading />;
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
					{ shouldShowAddAttachSite ? __( 'No site attached' ) : site.name }
				</span>
			}
			link={
				shouldShowAddAttachSite
					? `/domains/${ domain.domain }/transfer/other-site`
					: `/sites/${ site.slug }`
			}
			icon={ shouldShowAddAttachSite ? <Icon icon={ layout } /> : <SiteIcon site={ site } /> }
			description={
				shouldShowAddAttachSite
					? __( 'Attach this domain name to an existing site.' )
					: domain.site_slug
			}
		/>
	);
}
