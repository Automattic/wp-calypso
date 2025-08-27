import { __ } from '@wordpress/i18n';
import { Domain } from '../../data/domain';
import { Site } from '../../data/site';
import OverviewCard from '../../sites/overview-card';
import SiteIcon from '../../sites/site-icon';

interface Props {
	domain: Domain;
	site: Site;
}

export default function FeaturedCardSite( { domain, site }: Props ) {
	return (
		<OverviewCard
			title={ __( 'Site' ) }
			heading={ <span style={ { wordBreak: 'break-all' } }>{ site.name }</span> }
			externalLink={ site.URL }
			icon={ <SiteIcon site={ site } /> }
			description={ domain.domain }
		/>
	);
}
