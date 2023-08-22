import { useSiteDomainsQuery, useSiteQuery } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { PrimaryDomainLabel } from '../primary-domain-label';
import type {
	PartialDomainData,
	SiteDomainsQueryFnData,
	SiteDetails,
} from '@automattic/data-stores';

interface DomainsTableRowProps {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	isSelected: boolean;
	onSelect( domain: PartialDomainData ): void;

	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
	fetchSite?: ( siteIdOrSlug: number | string | null | undefined ) => Promise< SiteDetails >;
}

export function DomainsTableRow( {
	domain,
	isAllSitesView,
	isSelected,
	onSelect,
	fetchSiteDomains,
	fetchSite,
}: DomainsTableRowProps ) {
	const { __ } = useI18n();
	const { ref, inView } = useInView( { triggerOnce: true } );

	const { data: allSiteDomains } = useSiteDomainsQuery( domain.blog_id, {
		enabled: inView,
		...( fetchSiteDomains && { queryFn: () => fetchSiteDomains( domain.blog_id ) } ),
	} );

	const isPrimaryDomain = useMemo(
		() => allSiteDomains?.domains?.find( ( d ) => d.primary_domain )?.domain === domain.domain,
		[ allSiteDomains, domain.domain ]
	);

	const { data: site } = useSiteQuery( domain.blog_id, {
		enabled: inView,
		...( fetchSite && { queryFn: () => fetchSite( domain.blog_id ) } ),
	} );

	const siteSlug = useMemo( () => {
		if ( ! site?.URL ) {
			// Fall back to the site's ID if we're still loading detailed site data
			return domain.blog_id.toString( 10 );
		}

		if ( site.options.is_redirect && site.options.unmapped_url ) {
			return new URL( site.options.unmapped_url ).host;
		}

		return new URL( site.URL ).host.replace( /\//g, '::' );
	}, [ site, domain.blog_id ] );

	const isManageableDomain = ! domain.wpcom_domain;
	const shouldDisplayPrimaryDomainLabel = ! isAllSitesView && isPrimaryDomain;

	return (
		<tr key={ domain.domain } ref={ ref }>
			<td>
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ isSelected }
					onChange={ () => onSelect( domain ) }
					/* translators: Label for a checkbox control that selects a domain name.*/
					aria-label={ sprintf( __( 'Tick box for %(domain)s', __i18n_text_domain__ ), {
						domain: domain.domain,
					} ) }
				/>
			</td>
			<td>
				{ shouldDisplayPrimaryDomainLabel && <PrimaryDomainLabel /> }
				{ isManageableDomain ? (
					<a
						className="domains-table__domain-link"
						href={ domainManagementLink( domain, siteSlug, isAllSitesView ) }
					>
						{ domain.domain }
					</a>
				) : (
					domain.domain
				) }
			</td>
		</tr>
	);
}

function domainManagementLink(
	{ domain, type }: PartialDomainData,
	siteSlug: string,
	isAllSitesView: boolean
) {
	const viewSlug = domainManagementViewSlug( type );

	// Encodes only real domain names and not parameter placeholders
	if ( ! domain.startsWith( ':' ) ) {
		// Encodes domain names so addresses with slashes in the path (e.g. used in site redirects) don't break routing.
		// Note they are encoded twice since page.js decodes the path by default.
		domain = encodeURIComponent( encodeURIComponent( domain ) );
	}

	if ( isAllSitesView ) {
		return `/domains/manage/all/${ domain }/${ viewSlug }/${ siteSlug }`;
	}

	return `/domains/manage/${ domain }/${ viewSlug }/${ siteSlug }`;
}

function domainManagementViewSlug( type: PartialDomainData[ 'type' ] ) {
	switch ( type ) {
		case 'transfer':
			return 'transfer/in';
		case 'redirect':
			return 'redirect';
		default:
			return 'edit';
	}
}
