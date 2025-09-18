import { DomainSubtype } from '@automattic/api-core';
import { domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalGrid as Grid } from '@wordpress/components';
import { domainRoute } from '../../app/router/domains';
import FeaturedCardEmails from './featured-card-emails';
import FeaturedCardPrivacy from './featured-card-privacy';
import FeaturedCardRenew from './featured-card-renew';
import FeaturedCardSite from './featured-card-site';

export default function FeaturedCards() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	return (
		<Grid columns={ 2 }>
			{ domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && (
				<FeaturedCardRenew domain={ domain } />
			) }
			<FeaturedCardSite domain={ domain } />
			<FeaturedCardEmails domain={ domain } />
			{ domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && (
				<FeaturedCardPrivacy domain={ domain } />
			) }
		</Grid>
	);
}
