import { formatCurrency } from '@automattic/number-formatters';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useLocale } from '../../app/locale';
import { domainQuery } from '../../app/queries/domain';
import { sitePurchaseQuery } from '../../app/queries/site-purchases';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatDate } from '../../utils/datetime';
import { getDomainRenewalUrl } from '../../utils/domain';
import Actions from './actions';

export default function DomainOverview() {
	const locale = useLocale();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: purchase } = useQuery(
		sitePurchaseQuery( domain.blog_id, parseInt( domain.subscription_id, 10 ) )
	);

	const wrappableDomainName = useMemo( () => {
		const [ domainName, ...tlds ] = domain.domain.split( '.' );
		const tld = tlds.join( '.' );

		return (
			<span style={ { wordBreak: 'break-word', hyphens: 'none' } }>
				{ domainName }
				<span style={ { whiteSpace: 'nowrap' } }>.{ tld }</span>
			</span>
		);
	}, [ domain.domain ] );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ wrappableDomainName }
					// translators: date is the date the domain was registered.
					description={ sprintf( __( 'Registered on %(date)s' ), {
						date: formatDate( new Date( domain.registration_date ), locale, { dateStyle: 'long' } ),
					} ) }
					actions={
						purchase?.can_explicit_renew && (
							<Button
								variant="primary"
								__next40pxDefaultSize
								href={ getDomainRenewalUrl( domain, purchase ) }
							>
								{
									// translators: price is the price of the domain renewal.
									sprintf( __( 'Renew now for %(price)s' ), {
										price: formatCurrency( purchase.price_integer, purchase.currency_code, {
											isSmallestUnit: true,
											stripZeros: true,
										} ),
									} )
								}
							</Button>
						)
					}
				/>
			}
		>
			<Actions />
		</PageLayout>
	);
}
