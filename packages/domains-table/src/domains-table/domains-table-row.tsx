import { useSiteDomainsQuery } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { PrimaryDomainLabel } from '../primary-domain-label';
import type { PartialDomainData, SiteDomainsQueryFnData } from '@automattic/data-stores';

interface DomainsTableRowProps {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	isSelected: boolean;
	onSelect( domain: PartialDomainData ): void;

	fetchSiteDomains?: (
		siteIdOrSlug: number | string | null | undefined
	) => Promise< SiteDomainsQueryFnData >;
}

export function DomainsTableRow( {
	domain,
	isAllSitesView,
	isSelected,
	onSelect,
	fetchSiteDomains,
}: DomainsTableRowProps ) {
	const { __ } = useI18n();
	const { ref, inView } = useInView( { triggerOnce: true } );

	const { data } = useSiteDomainsQuery( domain.blog_id, {
		enabled: inView,
		...( fetchSiteDomains && { queryFn: () => fetchSiteDomains( domain.blog_id ) } ),
	} );

	const { siteSlug, primaryDomain } = useMemo( () => {
		const primaryDomain = data?.domains?.find( ( d ) => d.primary_domain );
		const unmappedDomain = data?.domains?.find( ( d ) => d.wpcom_domain );
		const siteSlug =
			primaryDomain?.type === 'redirect' ? unmappedDomain?.domain : primaryDomain?.domain;

		return {
			// Fall back to the site's ID if we're still loading detailed domain data
			siteSlug: siteSlug || domain.blog_id.toString( 10 ),
			primaryDomain,
		};
	}, [ data, domain.blog_id ] );

	const isPrimaryDomain = primaryDomain?.domain === domain.domain;
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
