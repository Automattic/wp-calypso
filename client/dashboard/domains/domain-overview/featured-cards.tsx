import { DomainSubtype } from '@automattic/api-core';
import { domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useViewportMatch } from '@wordpress/compose';
import { domainRoute } from '../../app/router/domains';
import Grid from '../../components/grid';
import FeaturedCardEmails from './featured-card-emails';
import FeaturedCardPrivacy from './featured-card-privacy';
import FeaturedCardRenew from './featured-card-renew';
import FeaturedCardSite from './featured-card-site';

const SPACING = {
	DEFAULT: 'xl',
	SMALL: 'lg',
} as const;

export default function FeaturedCards( { isDisabled }: { isDisabled?: boolean } ) {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const columns = isSmallViewport ? 1 : 2;
	const spacing = isSmallViewport ? SPACING.SMALL : SPACING.DEFAULT;

	return (
		<Grid columns={ columns } gap={ spacing }>
			{ domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && (
				<FeaturedCardRenew domain={ domain } />
			) }
			<FeaturedCardSite domain={ domain } />
			<FeaturedCardEmails domain={ domain } />
			{ domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION && (
				<FeaturedCardPrivacy domain={ domain } isDisabled={ isDisabled } />
			) }
		</Grid>
	);
}
