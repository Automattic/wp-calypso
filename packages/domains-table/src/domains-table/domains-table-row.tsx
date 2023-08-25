import { LoadingPlaceholder } from '@automattic/components';
import { useSiteDomainsQuery, useSiteQuery } from '@automattic/data-stores';
import { CheckboxControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { PrimaryDomainLabel } from '../primary-domain-label';
import { DomainsTableRegisteredUntilCell } from './domains-table-registered-until-cell';
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

	const { data: allSiteDomains, isLoading: isLoadingSiteDomainsDetails } = useSiteDomainsQuery(
		domain.blog_id,
		{
			enabled: inView,
			...( fetchSiteDomains && { queryFn: () => fetchSiteDomains( domain.blog_id ) } ),
		}
	);

	const currentDomainData = useMemo( () => {
		return allSiteDomains?.domains.find( ( d ) => d.domain === domain.domain );
	}, [ allSiteDomains, domain.domain ] );

	const isPrimaryDomain = useMemo(
		() => allSiteDomains?.domains?.find( ( d ) => d.primary_domain )?.domain === domain.domain,
		[ allSiteDomains, domain.domain ]
	);

	const { data: site, isLoading: isLoadingSiteDetails } = useSiteQuery( domain.blog_id, {
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

	const placeholderWidth = useMemo( () => {
		const MIN = 40;
		const MAX = 100;

		return Math.floor( Math.random() * ( MAX - MIN + 1 ) ) + MIN;
	}, [] );

	const getSiteColumn = () => {
		if ( ! site || ! currentDomainData ) {
			return null;
		}

		if ( currentDomainData.current_user_can_create_site_from_domain_only ) {
			return createInterpolateElement(
				/* translators: ariaHidden means that the component will be skipped by screen readers. */
				__(
					'<create>Create</create> <ariaHidden>or</ariaHidden> <connect>connect</connect> <ariaHidden>a site</ariaHidden>'
				),
				{
					create: (
						<a
							href={ domainOnlySiteCreationLink( siteSlug, site?.ID ) }
							aria-label={ __( 'Create a site for this domain' ) }
						/>
					),
					connect: (
						<a
							href={ domainManagementTransferToOtherSiteLink( siteSlug, domain.domain ) }
							aria-label={ __( 'Connect this domain to an existing site' ) }
						/>
					),
					ariaHidden: <span aria-hidden={ true } />,
				}
			);
		}

		return site.name ?? '-';
	};

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
						className="domains-table__domain-name"
						href={ domainManagementLink( domain, siteSlug, isAllSitesView ) }
					>
						{ domain.domain }
					</a>
				) : (
					<span className="domains-table__domain-name">{ domain.domain }</span>
				) }
			</td>
			<td>
				{ isLoadingSiteDetails || isLoadingSiteDomainsDetails ? (
					<LoadingPlaceholder style={ { width: `${ placeholderWidth }%` } } />
				) : (
					getSiteColumn()
				) }
			</td>
			<td></td>
			<td>
				<DomainsTableRegisteredUntilCell domain={ domain } />
			</td>
		</tr>
	);
}

export function domainOnlySiteCreationLink( siteSlug: string, siteId: number ) {
	return `/start/site-selected/?siteSlug=${ encodeURIComponent(
		siteSlug
	) }&siteId=${ encodeURIComponent( siteId ) }`;
}

export function domainManagementTransferToOtherSiteLink( siteSlug: string, domainName: string ) {
	return `/domains/manage/all/${ domainName }/transfer/other-site/${ siteSlug }`;
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
