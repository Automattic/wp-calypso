import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { domainQuery } from '../../app/queries/domain';
import { siteByIdQuery } from '../../app/queries/site';
import { domainRoute } from '../../app/router/domains';
import FeaturedCardRenew from './featured-card-renew';
import FeaturedCardSite from './featured-card-site';

export default function FeaturedCards() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: site } = useSuspenseQuery( siteByIdQuery( domain.blog_id ) );

	return (
		<Grid columns={ 2 }>
			<FeaturedCardRenew domain={ domain } />
			{ site && <FeaturedCardSite domain={ domain } site={ site } /> }
		</Grid>
	);
}
