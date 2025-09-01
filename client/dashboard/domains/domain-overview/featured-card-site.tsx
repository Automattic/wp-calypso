import { Domain } from '@automattic/api-core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { siteByIdQuery } from '../../app/queries/site';
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

	return (
		<OverviewCard
			title={ __( 'Site' ) }
			heading={ <span style={ { wordBreak: 'break-all' } }>{ site.name }</span> }
			link={ `/sites/${ site.slug }` }
			icon={ <SiteIcon site={ site } /> }
			description={ domain.domain }
		/>
	);
}
