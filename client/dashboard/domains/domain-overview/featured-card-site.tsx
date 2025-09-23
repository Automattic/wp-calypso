import { Domain, DomainSubtype } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
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
			title={ __( 'Site' ) }
			heading={ <span style={ { wordBreak: 'break-all' } }>{ site.name }</span> }
			link={
				shouldShowAddAttachSite
					? `/domains/${ domain.domain }/transfer/other-site`
					: `/sites/${ site.slug }`
			}
			icon={ <SiteIcon site={ site } /> }
			description={
				shouldShowAddAttachSite ? __( 'Attach to an existing site' ) : domain.site_slug
			}
			bottom={
				shouldShowAddAttachSite && (
					<ButtonStack>
						<Button
							size="compact"
							variant="primary"
							href={ `/start/site-selected/?siteSlug=${ site.slug }&siteId=${ site.ID }` }
						>
							{ __( 'Add a new site' ) }
						</Button>
					</ButtonStack>
				)
			}
		/>
	);
}
