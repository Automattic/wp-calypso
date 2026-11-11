import { DomainSubtype } from '@automattic/api-core';
import {
	domainQuery,
	purchaseQuery,
	domainDiagnosticsQuery,
	domainMappingStatusQuery,
} from '@automattic/api-queries';
import { Breadcrumbs } from '@automattic/components/src/breadcrumbs';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useMemo } from 'react';
import { useLocale } from '../../app/locale';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import PendingPrimaryDomainNotice from '../../components/pending-primary-domain-notice';
import { formatDate } from '../../utils/datetime';
import { getDomainTypeLabel, isTldInMaintenance } from '../../utils/domain';
import { getRenewalUrlFromPurchase } from '../../utils/purchase';
import { TLDMaintenanceNotice } from '../maintenance-notice';
import Actions from './actions';
import IcannSuspensionNotice from './icann-suspension-notice';
import PendingRegistrationNotice from './pending-registration-notice';
import PointToWpcomNotice from './point-to-wpcom-notice';
import DomainOverviewRegistration from './registration';
import { useRenewalNote } from './renewal-summary';
import DomainOverviewSettings from './settings';
import DomainOverviewSslStatus from './ssl-status';
import TransferredDomainDetails from './transferred-domain-details';

export default function DomainOverview() {
	const locale = useLocale();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const renewalNote = useRenewalNote( domain );

	const { data: purchase } = useQuery( {
		...purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) ),
		enabled: !! domain.subscription_id,
	} );

	const { data: domainMappingStatus } = useQuery( {
		...domainMappingStatusQuery( domain.domain ),
		enabled: domain.subtype.id === DomainSubtype.DOMAIN_CONNECTION,
	} );

	const { data: diagnosticsData } = useQuery( {
		...domainDiagnosticsQuery( domain.domain ),
		enabled: domain.is_mapped_to_atomic_site && domain.primary_domain,
	} );

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

	const getRegistrationNote = () => {
		switch ( domain.subtype.id ) {
			case DomainSubtype.DOMAIN_CONNECTION:
				// translators: %(date)s: the date the domain was connected.
				return sprintf( __( 'Connected on %(date)s' ), { date: formattedRegistrationDate } );
			case DomainSubtype.DOMAIN_REGISTRATION:
				// translators: %(date)s: the date the domain was registered.
				return sprintf( __( 'Registered on %(date)s' ), { date: formattedRegistrationDate } );
			default:
				return null;
		}
	};

	return (
		<>
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={
							<Breadcrumbs
								items={ [
									{ label: __( 'Domains' ), href: '/domains' },
									{ label: domain.domain, href: '' },
								] }
								renderItemLink={ ( { href, label, ...rest } ) => (
									<Link to={ href } { ...rest }>
										{ label }
									</Link>
								) }
							/>
						}
						title={ wrappableDomainName }
						description={
							<HStack spacing={ 2 } alignment="center" justify="flex-start" wrap>
								{ domain.subtype.id !== DomainSubtype.DOMAIN_REGISTRATION && (
									<Badge>{ getDomainTypeLabel( domain ) }</Badge>
								) }
								<DomainOverviewSslStatus domain={ domain } />
								<span>
									{ [ getRegistrationNote(), renewalNote ].filter( Boolean ).join( ' · ' ) }
								</span>
							</HStack>
						}
						actions={
							( purchase?.can_explicit_renew || purchase?.is_renewable ) &&
							domain.current_user_is_owner && (
								<Button
									variant="primary"
									__next40pxDefaultSize
									disabled={ isTldInMaintenance( domain ) }
									href={ getRenewalUrlFromPurchase( purchase ) }
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
				notices={
					isTldInMaintenance( domain ) && <TLDMaintenanceNotice showGoBackLink={ false } />
				}
			>
				<PendingRegistrationNotice domain={ domain } />
				<PointToWpcomNotice domain={ domain } isDisabled={ isTldInMaintenance( domain ) } />
				{ domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER && (
					<TransferredDomainDetails domain={ domain } />
				) }
				{ domain.is_pending_icann_verification && <IcannSuspensionNotice domain={ domain } /> }
				<PendingPrimaryDomainNotice domainName={ domain.domain } />
				{ domain.subtype.id !== DomainSubtype.DOMAIN_TRANSFER && (
					<>
						<DomainOverviewRegistration
							domain={ domain }
							isDisabled={ isTldInMaintenance( domain ) }
						/>
						<DomainOverviewSettings
							isDisabled={ isTldInMaintenance( domain ) }
							domain={ domain }
							domainDiagnostics={ diagnosticsData }
							domainMappingStatus={ domainMappingStatus }
						/>
					</>
				) }
				<Actions isDisabled={ isTldInMaintenance( domain ) } />
			</PageLayout>
			<PerformanceTrackerStop />
		</>
	);
}
