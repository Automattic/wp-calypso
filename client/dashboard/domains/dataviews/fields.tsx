import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { Text } from '../../components/text';
import { DomainNameField } from './field-domain-name';
import { DomainSiteField } from './field-domain-site';
import { DomainStatusField } from './field-domain-status';
import { DomainExpiryField } from './field-expiry';
import { DomainSslField } from './field-ssl';
import { IneligibleIndicator } from './ineligible-indicator';
import { sortNullableStrings } from './sort-nullable-strings';
import type { DomainSummary, Site } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

export const useFields = ( {
	site,
	showPrimaryDomainBadge = true,
	inOverview = false,
}: {
	site?: Site;
	showPrimaryDomainBadge?: boolean;
	inOverview?: boolean;
} = {} ) => {
	const { data: domains } = useQuery( domainsQuery() );

	const siteElements = useMemo( () => {
		if ( ! domains ) {
			return [];
		}
		const siteMap = new Map< number, { value: string; label: string } >();

		for ( const domain of domains ) {
			if ( ! domain.is_domain_only_site && domain.subtype.id !== DomainSubtype.DOMAIN_CONNECTION ) {
				siteMap.set( domain.blog_id, {
					value: domain.blog_id.toString(),
					label: domain.blog_name,
				} );
			}
		}

		return Array.from( siteMap.values() );
	}, [ domains ] );

	const fields: Field< DomainSummary >[] = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Domain name' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item }: { item: DomainSummary } ) => item.domain,
				render: ( { field, item } ) => (
					<DomainNameField
						domain={ item }
						site={ site }
						value={ field.getValue( { item } ) }
						showPrimaryDomainBadge={ showPrimaryDomainBadge }
					/>
				),
			},
			{
				id: 'is_primary_domain',
				label: __( 'Primary' ),
				getValue: ( { item }: { item: DomainSummary } ) => item.primary_domain,
				sort: ( a, b, direction ) => {
					if ( a.primary_domain === b.primary_domain ) {
						return 0;
					}

					const factor = direction === 'asc' ? 1 : -1;
					return a.primary_domain ? -1 * factor : 1 * factor;
				},
				render: ( { field, item } ) =>
					field.getValue( { item } ) ? <Text>{ __( 'Primary' ) }</Text> : <IneligibleIndicator />,
			},
			{
				id: 'subtype',
				label: __( 'Type' ),
				enableHiding: false,
				enableSorting: false,
				elements: [
					{ value: DomainSubtype.DOMAIN_REGISTRATION, label: __( 'Domain name registration' ) },
					{ value: DomainSubtype.DOMAIN_TRANSFER, label: __( 'Domain name transfer' ) },
					{ value: DomainSubtype.DOMAIN_CONNECTION, label: __( 'Domain name connection' ) },
					{ value: DomainSubtype.DEFAULT_ADDRESS, label: __( 'Included site address' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item }: { item: DomainSummary } ) => item.subtype.id,
			},
			{
				id: 'owner',
				label: __( 'Owner' ),
				enableHiding: true,
				enableSorting: true,
				elements: [
					{ value: 'owned-by-me', label: __( 'Me' ) },
					{ value: 'owned-by-someone-else', label: __( 'Someone else' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item }: { item: DomainSummary } ) =>
					item?.current_user_is_owner ? 'owned-by-me' : 'owned-by-someone-else',
				render: ( { field, item } ) =>
					field.getValue( { item } ) === 'owned-by-me' ? (
						<Text intent="success">{ __( 'Owned by me' ) }</Text>
					) : (
						<IneligibleIndicator />
					),
			},
			{
				id: 'blog_name',
				label: __( 'Site' ),
				enableHiding: false,
				enableSorting: true,
				elements: siteElements,
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item }: { item: DomainSummary } ) => item.blog_id.toString(),
				render: ( { item } ) => <DomainSiteField domain={ item } value={ item.blog_name ?? '' } />,
			},
			{
				id: 'ssl_status',
				label: __( 'SSL' ),
				enableHiding: true,
				enableSorting: false,
				render: ( { item } ) => <DomainSslField domain={ item } />,
			},
			{
				id: 'expiry',
				label: __( 'Paid until' ),
				enableHiding: false,
				enableSorting: true,
				sort: sortNullableStrings,
				elements: [
					{ value: '2-next-90-days', label: __( '90 days' ) },
					{ value: '1-expired', label: __( 'Expired' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item }: { item: DomainSummary } ) => {
					if ( ! item.expiry ) {
						return null;
					}

					const expiryDate = new Date( item.expiry );
					const now = new Date();
					const diffInMs = expiryDate.getTime() - now.getTime();
					const diffInDays = Math.ceil( diffInMs / ( 1000 * 60 * 60 * 24 ) );

					if ( item.expired ) {
						return '1-expired';
					} else if ( diffInDays <= 90 ) {
						return '2-next-90-days';
					}
					return '3-more-than-90-days';
				},
				render: ( { item } ) => {
					return (
						<DomainExpiryField
							inOverview={ inOverview ?? false }
							domain={ item }
							value={ item.expiry ? dateI18n( 'F j, Y', item.expiry ) : '' }
						/>
					);
				},
			},
			{
				id: 'domain_status',
				label: __( 'Status' ),
				enableHiding: false,
				enableSorting: true,
				elements: [
					{ value: DomainStatus.ACTIVE, label: __( 'Active' ) },
					{ value: DomainStatus.EXPIRED, label: __( 'Expired' ) },
					{ value: DomainStatus.EXPIRING_SOON, label: __( 'Expiring soon' ) },
					{ value: DomainStatus.EXPIRED_IN_AUCTION, label: __( 'Expired & in auction' ) },
					{ value: DomainStatus.PENDING_RENEWAL, label: __( 'Pending renewal' ) },
					{ value: DomainStatus.PENDING_REGISTRATION, label: __( 'Pending registration' ) },
					{ value: DomainStatus.PENDING_TRANSFER, label: __( 'Outgoing transfer pending' ) },
					{ value: DomainStatus.IN_PROGRESS, label: __( 'Incoming transfer in progress' ) },
					{ value: DomainStatus.TRANSFER_COMPLETED, label: __( 'Incoming transfer completed' ) },
					{ value: DomainStatus.TRANSFER_ERROR, label: __( 'Incoming transfer failed' ) },
					{ value: DomainStatus.TRANSFER_PENDING, label: __( 'Incoming transfer pending' ) },
					{ value: DomainStatus.CONNECTION_ERROR, label: __( 'Connection error' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item } ) => item.domain_status.id,
				render: ( { item } ) => {
					return <DomainStatusField domain={ item } value={ item.domain_status.label } />;
				},
			},
		],
		[ site, showPrimaryDomainBadge, siteElements ]
	);

	return fields;
};
