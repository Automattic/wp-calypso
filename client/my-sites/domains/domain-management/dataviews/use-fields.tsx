import { PartialDomainData } from '@automattic/data-stores';
import { DomainsTableExpiresRenewsOnCell } from '@automattic/domains-table/src/domains-table/domains-table-expires-renews-cell';
import { DomainsTableSiteCell } from '@automattic/domains-table/src/domains-table/domains-table-site-cell';
import { SiteExcerptData } from '@automattic/sites';
import { Field } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { DomainField } from './dataviews-fields/domain-field';
import { DomainStatusField } from './dataviews-fields/domain-status-field';
import { SslStatusField } from './dataviews-fields/ssl-status-field';
import { DomainData } from './types';
import { useDomainsDataViewsContext } from './use-context';

interface Props {
	openDomainPane?: ( domain: DomainData ) => void;
}

export function useFields( { openDomainPane }: Props ) {
	const translate = useTranslate();
	const { isAllSitesView, domainsRequiringAttention, sites, selectedFeature } =
		useDomainsDataViewsContext();

	const siteSlug = ( domain: PartialDomainData, site?: SiteExcerptData ) => {
		if ( ! site?.URL ) {
			// Fall back to the site's ID if we're still loading detailed site data
			return domain.blog_id.toString( 10 );
		}

		if ( site.options?.is_redirect && site.options?.unmapped_url ) {
			return new URL( site.options.unmapped_url ).host;
		}

		return new URL( site.URL ).host.replace( /\//g, '::' );
	};

	const fields = useMemo< Field< DomainData >[] >(
		() => [
			{
				id: 'domain_name',
				label: translate( 'Domains' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item }: { item: DomainData } ) => item.processed.domain,
				render: ( { item }: { item: DomainData } ) => (
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
				getValue: ( { item }: { item: DomainData } ) =>
					item.processed.owner.replace( / \((?!.*\().+\)$/, '' ),
				render: ( { item }: { item: DomainData } ) => {
					// Removes the username that appears in parentheses after the owner's name.
					// Uses $ and the negative lookahead assertion (?!.*\() to ensure we only match the very last parenthetical.
					return item.processed.owner
						? item.processed.owner.replace( / \((?!.*\().+\)$/, '' )
						: '-';
				},
			},
			{
				id: 'site',
				label: translate( 'Site' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: DomainData } ) => item.original.blog_name ?? '',
				render: ( { item }: { item: DomainData } ) => {
					const site = sites[ item.processed.blogId ];
					const userCanAddSiteToDomain =
						item.processed.currentUserCanCreateSiteFromDomainOnly ?? false;

					return (
						<DomainsTableSiteCell
							site={ site }
							userCanAddSiteToDomain={ userCanAddSiteToDomain }
							siteSlug={ siteSlug( item.original, site ) }
						/>
					);
				},
			},
			{
				id: 'ssl_status',
				label: translate( 'SSL' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: DomainData } ) => item.processed.sslStatus,
				render: ( { item }: { item: DomainData } ) => <SslStatusField domain={ item } />,
			},
			{
				id: 'expiry',
				label: translate( 'Expires/Renews on' ),
				enableHiding: false,
				enableSorting: true,
				getValue: ( { item }: { item: DomainData } ) =>
					item.processed.expiry ? Date.parse( item.processed.expiry ) : 0,
				render: ( { item }: { item: DomainData } ) => (
					<DomainsTableExpiresRenewsOnCell domain={ item.original } as="div" />
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
				getValue: ( { item }: { item: DomainData } ) => item.original.domain_status.status,
				render: ( { item }: { item: DomainData } ) => <DomainStatusField domain={ item } />,
			},
		],
		[ domainsRequiringAttention, isAllSitesView, openDomainPane, sites, translate ]
	);

	return fields;
}
