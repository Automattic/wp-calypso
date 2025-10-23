import { DomainSubtype } from '@automattic/api-core';
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
				label: __( 'Domain' ),
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
					{ value: DomainSubtype.DEFAULT_ADDRESS, label: __( 'Default site address' ) },
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
				label: __( 'Expires/Renews on' ),
				enableHiding: false,
				enableSorting: true,
				elements: [
					{ value: 'next-7-days', label: __( 'Next 7 days' ) },
					{ value: 'next-30-days', label: __( 'Next 30 days' ) },
					{ value: 'next-90-days', label: __( 'Next 90 days' ) },
					{ value: 'expired', label: __( 'Expired' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item }: { item: DomainSummary } ) => {
					if ( ! item.expiry ) {
						return '';
					}

					const expiryDate = new Date( item.expiry );
					const now = new Date();
					const diffInDays = Math.ceil(
						( expiryDate.getTime() - now.getTime() ) / ( 1000 * 60 * 60 * 24 )
					);

					if ( diffInDays < 0 ) {
						return 'expired';
					} else if ( diffInDays <= 7 ) {
						return 'next-7-days';
					} else if ( diffInDays <= 30 ) {
						return 'next-30-days';
					} else if ( diffInDays <= 90 ) {
						return 'next-90-days';
					}

					return 'later';
				},
				render: ( { item } ) => {
					// Site Overview does not show the Status column, so we use this column for error messages.
					// TODO: move this inside the DomainExpiryField component?
					if (
						inOverview &&
						item.subtype.id === DomainSubtype.DOMAIN_CONNECTION &&
						item.domain_status.id === 'connection_error'
					) {
						return <Text intent={ item.domain_status.type }>{ item.domain_status.label }</Text>;
					}

					return (
						<DomainExpiryField
							domain={ item }
							value={ item.expiry ? dateI18n( 'F j, Y', item.expiry ) : '' }
							isCompact={ !! site }
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
					{ value: 'success', label: __( 'Active' ) },
					{ value: 'neutral', label: __( 'Parked' ) },
					{ value: 'error', label: __( 'Expiring soon' ) },
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
				},
				getValue: ( { item } ) => item.domain_status.label,
				render: ( { item } ) => {
					return <DomainStatusField domain={ item } value={ item.domain_status.label } />;
				},
			},
		],
		[ site, showPrimaryDomainBadge, siteElements ]
	);

	return fields;
};
