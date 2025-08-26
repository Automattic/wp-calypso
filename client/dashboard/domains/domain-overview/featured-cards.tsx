import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { domainQuery } from '../../app/queries/domain';
import { domainRoute } from '../../app/router/domains';
import FeaturedCardRenew from './featured-card-renew';

export default function FeaturedCards() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	return (
		<Grid columns={ 2 }>
			<FeaturedCardRenew domain={ domain } />
		</Grid>
	);
}
