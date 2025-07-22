import { Badge } from '@automattic/ui';
import { Link } from '@tanstack/react-router';
import {
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { dateI18n } from '@wordpress/date';
import { sprintf, __ } from '@wordpress/i18n';
import { caution, reusableBlock } from '@wordpress/icons';
import { useMemo } from 'react';
import { DomainTypes } from '../../data/domains';
import type { Domain, Site } from '../../data/types';
import type { Field } from '@wordpress/dataviews';

const textOverflowStyles = {
	overflowX: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

const IneligibleIndicator = () => <Text color="#CCCCCC">-</Text>;

const DomainName = ( { domain, site, value }: { domain: Domain; site?: Site; value: string } ) => {
	const siteSlug = site?.slug ?? domain.site_slug;
	const domainManagementUrl = site
		? `${ window.location.origin }/overview/site-domain/domain/${ domain.domain }/${ siteSlug }`
		: `${ window.location.origin }/domains/manage/all/overview/${ domain.domain }/${ siteSlug }`;

	return (
		<Link to={ domainManagementUrl } disabled={ domain.type === DomainTypes.WPCOM }>
			<HStack alignment="center" spacing={ 1 }>
				<span style={ textOverflowStyles }>{ value }</span>
				{ domain.primary_domain && (
					<span style={ { flexShrink: 0 } }>
						<Badge>{ __( 'Primary' ) }</Badge>
					</span>
				) }
			</HStack>
		</Link>
	);
};

const DomainExpiry = ( {
	domain,
	value,
	isCompact = false,
}: {
	domain: Domain;
	value: string;
	isCompact?: boolean;
} ) => {
	if ( ! domain.expiry ) {
		return __( 'Free forever' );
	}

	const isAutoRenewing = Boolean( domain.auto_renewing );
	const isExpired = new Date( domain.expiry ) < new Date();
	const isHundredYearDomain = Boolean( domain.is_hundred_year_domain );
	const renderExpiry = () => {
		if ( isHundredYearDomain ) {
			return sprintf(
				/* translators: %s - The date until which a domain was paid for */
				__( 'Paid until %s' ),
				value
			);
		}

		if ( isExpired ) {
			return sprintf(
				/* translators: %s - The date on which a domain has expired */
				__( 'Expired on %s' ),
				value
			);
		}

		if ( ! isAutoRenewing ) {
			return sprintf(
				/* translators: %s - The date on which a domain expires */
				__( 'Expires on %s' ),
				value
			);
		}

		return sprintf(
			/* translators: %s - The future date on which a domain renews */
			__( 'Renews on %s' ),
			value
		);
	};

	return (
		<HStack justify="flex-start" alignment="center" spacing={ 1 }>
			{ ! isCompact && (
				<Icon
					icon={ isExpired || isHundredYearDomain ? caution : reusableBlock }
					size={ 16 }
					style={ { fill: 'currentColor' } }
				/>
			) }
			<span>{ renderExpiry() }</span>
		</HStack>
	);
};

export const useFields = ( { site }: { site?: Site } = {} ) => {
	const fields: Field< Domain >[] = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Domains' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item }: { item: Domain } ) => item.domain,
				render: ( { field, item } ) => (
					<DomainName domain={ item } site={ site } value={ field.getValue( { item } ) } />
				),
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
				getValue: ( { item }: { item: Domain } ) => item.blog_name ?? '',
			},
			// {
			// 	id: 'ssl_status',
			// 	label: __( 'SSL' ),
			// 	enableHiding: false,
			// 	enableSorting: true,
			// },
			{
				id: 'expiry',
				label: __( 'Expires/Renews on' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: Domain } ) =>
					item.expiry ? dateI18n( 'F j, Y', item.expiry ) : '',
				render: ( { field, item } ) => (
					<DomainExpiry
						domain={ item }
						value={ field.getValue( { item } ) }
						isCompact={ !! site }
					/>
				),
			},
			{
				id: 'domain_status',
				label: __( 'Status' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: Domain } ) => item.domain_status?.status ?? '',
				render: ( { field, item } ) => {
					const value = field.getValue( { item } );
					return value || <IneligibleIndicator />;
				},
			},
		],
		[ site ]
	);

	return fields;
};
