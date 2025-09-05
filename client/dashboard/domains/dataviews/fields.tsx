import { DomainTypes } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { domainOverviewRoute } from '../../app/router/domains';
import { siteRoute } from '../../app/router/sites';
import { Text } from '../../components/text';
import SiteIcon from '../../sites/site-icon';
import { isRecentlyRegistered } from '../../utils/domain';
import { DomainExpiryField } from './field-expiry';
import { DomainSslField } from './field-ssl';
import type { DomainSummary, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const THREE_DAYS_IN_MINUTES = 3 * 1440;

const textOverflowStyles = {
	overflowX: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

const IneligibleIndicator = () => <Text color="#CCCCCC">-</Text>;

const DomainName = ( {
	domain,
	site,
	value,
	showPrimaryDomainBadge,
}: {
	domain: DomainSummary;
	site?: Site;
	value: string;
	showPrimaryDomainBadge?: boolean;
} ) => {
	const siteSlug = site?.slug ?? domain.site_slug;

	return (
		<Link
			to={ domainOverviewRoute.fullPath }
			params={ { siteSlug, domainName: domain.domain } }
			disabled={ domain.type === DomainTypes.WPCOM }
		>
			<HStack spacing={ 1 }>
				<span style={ textOverflowStyles }>{ value }</span>
				{ showPrimaryDomainBadge && domain.primary_domain && (
					<span style={ { flexShrink: 0 } }>
						<Badge>{ __( 'Primary' ) }</Badge>
					</span>
				) }
			</HStack>
		</Link>
	);
};

const DomainSite = ( { domain, value }: { domain: DomainSummary; value: string } ) => {
	const { data: site } = useQuery( siteBySlugQuery( domain.site_slug ) );

	return (
		<HStack spacing={ 2 } alignment="left">
			{ site && <SiteIcon size={ 16 } site={ site } /> }
			<Link
				to={ siteRoute.fullPath }
				params={ { siteSlug: domain?.site_slug } }
				style={ { textDecoration: 'none' } }
			>
				<Text>{ value }</Text>
			</Link>
		</HStack>
	);
};

export const useFields = ( {
	site,
	showPrimaryDomainBadge = true,
}: {
	site?: Site;
	showPrimaryDomainBadge?: boolean;
} = {} ) => {
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
					<DomainName
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
				render: ( { field, item } ) =>
					field.getValue( { item } ) ? <Text>{ __( 'Primary' ) }</Text> : <IneligibleIndicator />,
			},
			{
				id: 'type',
				label: __( 'Type' ),
				enableHiding: false,
				enableSorting: false,
			},
			// {
			// 	id: 'owner',
			// 	label: __( 'Owner' ),
			// 	enableHiding: false,
			// 	enableSorting: true,
			// },
			{
				id: 'blog_name',
				label: __( 'Site' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: DomainSummary } ) => {
					return item.blog_name ?? '';
				},
				render: ( { field, item } ) => (
					<DomainSite domain={ item } value={ field.getValue( { item } ) } />
				),
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
				getValue: ( { item }: { item: DomainSummary } ) =>
					item.expiry ? dateI18n( 'F j, Y', item.expiry ) : '',
				render: ( { field, item } ) => {
					// Site Overview does not show the Status column, so we use this column for error messages.
					if (
						site &&
						item.type === DomainTypes.MAPPED &&
						! item.points_to_wpcom &&
						! isRecentlyRegistered( item.registration_date, THREE_DAYS_IN_MINUTES )
					) {
						return <Text intent="error">{ __( 'Connection error' ) }</Text>;
					}

					return (
						<DomainExpiryField
							domain={ item }
							value={ field.getValue( { item } ) }
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
				getValue: ( { item }: { item: DomainSummary } ) => item.domain_status?.status ?? '',
				render: ( { field, item } ) => {
					const value = field.getValue( { item } );
					return value || <IneligibleIndicator />;
				},
			},
		],
		[ site, showPrimaryDomainBadge ]
	);

	return fields;
};
