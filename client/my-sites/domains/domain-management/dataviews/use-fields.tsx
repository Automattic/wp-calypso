import { LoadingPlaceholder } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { DomainsTableExpiresRenewsOnCell } from '@automattic/domains-table/src/domains-table/domains-table-expires-renews-cell';
import { DomainsTableSiteCell } from '@automattic/domains-table/src/domains-table/domains-table-site-cell';
import { Field } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { DomainField } from './dataviews-fields/domain-field';
import { DomainStatusField } from './dataviews-fields/domain-status-field';
import { SslStatusField } from './dataviews-fields/ssl-status-field';
import { useDomainsDataViewsContext } from './use-context';

interface Props {
	openDomainPane?: ( domain: PartialDomainData ) => void;
}

export function useFields( { openDomainPane }: Props ) {
	const translate = useTranslate();
	const {
		isAllSitesView,
		domainsRequiringAttention,
		sites,
		isLoadingSites,
		selectedFeature,
		getSiteSlug,
		getFullDomain,
		hasConnectableSites,
	} = useDomainsDataViewsContext();

	const fields = useMemo< Field< PartialDomainData >[] >(
		() => [
			{
				id: 'domain_name',
				label: translate( 'Domains' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item }: { item: PartialDomainData } ) => item.domain,
				render: ( { item }: { item: PartialDomainData } ) => (
					<DomainField
						domain={ item }
						isAllSitesView={ isAllSitesView }
						selectedFeature={ selectedFeature }
						openDomainPane={ openDomainPane }
					/>
				),
			},
			{
				id: 'owner',
				label: translate( 'Owner' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: PartialDomainData } ) => {
					const domain = getFullDomain( item );
					if ( ! domain ) {
						return '';
					}
					// Removes the username that appears in parentheses after the owner's name.
					// Uses $ and the negative lookahead assertion (?!.*\() to ensure we only match the very last parenthetical.
					return domain.owner.replace( / \((?!.*\().+\)$/, '' );
				},
				render: ( { item }: { item: PartialDomainData } ) => {
					const domain = getFullDomain( item );
					if ( ! domain ) {
						return <LoadingPlaceholder />;
					}
					if ( ! domain.owner ) {
						return '-';
					}
					return domain.owner.replace( / \((?!.*\().+\)$/, '' );
				},
			},
			{
				id: 'site',
				label: translate( 'Site' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: PartialDomainData } ) => sites[ item.blog_id ]?.name ?? '',
				render: ( { item }: { item: PartialDomainData } ) => {
					const domain = getFullDomain( item );
					if ( isLoadingSites || ! domain ) {
						return <LoadingPlaceholder />;
					}

					const site = sites[ item.blog_id ];
					const userCanAddSiteToDomain = domain?.currentUserCanCreateSiteFromDomainOnly ?? false;

					return (
						<DomainsTableSiteCell
							site={ site }
							userCanAddSiteToDomain={ userCanAddSiteToDomain }
							siteSlug={ getSiteSlug( item ) }
							domainName={ domain.domain }
							hasConnectableSites={ hasConnectableSites }
						/>
					);
				},
			},
			{
				id: 'ssl_status',
				label: translate( 'SSL' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: PartialDomainData } ) => {
					const domain = getFullDomain( item );
					return domain?.sslStatus || '';
				},
				render: ( { item }: { item: PartialDomainData } ) => <SslStatusField domain={ item } />,
			},
			{
				id: 'expiry',
				label: translate( 'Expires/Renews on' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: PartialDomainData } ) =>
					item.expiry ? Date.parse( item.expiry ) : 0,
				render: ( { item }: { item: PartialDomainData } ) => (
					<DomainsTableExpiresRenewsOnCell domain={ item } as="div" />
				),
			},
			{
				id: 'domain_status',
				label: translate( 'Status' ),
				enableHiding: false,
				enableSorting: true,
				header: domainsRequiringAttention ? (
					<>
						{ translate( 'Status' ) }
						<span className="list-status-cell__bubble">{ domainsRequiringAttention }</span>
					</>
				) : (
					translate( 'Status' )
				),
				getValue: ( { item }: { item: PartialDomainData } ) => item.domain_status?.status,
				render: ( { item }: { item: PartialDomainData } ) => <DomainStatusField domain={ item } />,
			},
		],
		[
			domainsRequiringAttention,
			isAllSitesView,
			openDomainPane,
			sites,
			translate,
			getFullDomain,
			getSiteSlug,
			selectedFeature,
			isLoadingSites,
		]
	);

	return fields;
}
