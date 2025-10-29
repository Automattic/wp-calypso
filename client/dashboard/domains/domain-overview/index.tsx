import { DomainSubtype } from '@automattic/api-core';
import { domainQuery, purchaseQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useLocale } from '../../app/locale';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatDate } from '../../utils/datetime';
import { getDomainRenewalUrl } from '../../utils/domain';
import Actions from './actions';
import FeaturedCards from './featured-cards';
import IcannSuspensionNotice from './icann-suspension-notice';
import DomainOverviewSettings from './settings';
import TransferredDomainDetails from './transferred-domain-details';

export default function DomainOverview() {
	const locale = useLocale();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: purchase } = useSuspenseQuery(
		purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
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

	const formattedRegistrationDate = formatDate( new Date( domain.registration_date ), locale, {
		dateStyle: 'long',
	} );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ wrappableDomainName }
					description={
						<HStack spacing={ 2 } alignment="center" justify="flex-start">
							{ domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION &&
								domain.subtype?.label && <Badge>{ domain.subtype.label }</Badge> }
							<span>
								{ ( () => {
									switch ( domain.subtype.id ) {
										case DomainSubtype.DOMAIN_CONNECTION:
											// translators: date is the date the domain was connected.
											return sprintf( __( 'Connected on %(date)s' ), {
												date: formattedRegistrationDate,
											} );
										case DomainSubtype.DOMAIN_REGISTRATION:
											// translators: date is the date the domain was registered.
											return sprintf( __( 'Registered on %(date)s' ), {
												date: formattedRegistrationDate,
											} );
										default:
											return null;
									}
								} )() }
							</span>
						</HStack>
					}
					actions={
						purchase?.can_explicit_renew &&
						domain.current_user_is_owner && (
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
			{ domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER && (
				<TransferredDomainDetails domain={ domain } />
			) }
			{ domain.is_pending_icann_verification && (
				<IcannSuspensionNotice domainName={ domain.domain } />
			) }
			{ domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER && (
				<>
					<FeaturedCards />
					<DomainOverviewSettings domain={ domain } />
				</>
			) }
			<Actions />
		</PageLayout>
	);
}
