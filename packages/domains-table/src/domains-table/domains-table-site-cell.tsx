import { SiteDetails } from '@automattic/data-stores';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import {
	domainManagementTransferToOtherSiteLink,
	domainOnlySiteCreationLink,
} from '../domain-routes';
import { ResponseDomain } from '../utils/types';

interface DomainsTableSiteCellProps {
	site?: Pick< SiteDetails, 'ID' | 'name' >;
	currentDomainData?: ResponseDomain;
	siteSlug: string;
}

export const DomainsTableSiteCell = ( {
	site,
	currentDomainData,
	siteSlug,
}: DomainsTableSiteCellProps ) => {
	const { __ } = useI18n();

	if ( ! site || ! currentDomainData ) {
		return null;
	}

	if ( currentDomainData.currentUserCanCreateSiteFromDomainOnly ) {
		return createInterpolateElement(
			/* translators: ariaHidden means that the component will be skipped by screen readers. */
			__(
				'<create>Create</create> <ariaHidden>or</ariaHidden> <connect>connect</connect> <ariaHidden>a site</ariaHidden>'
			),
			{
				create: (
					<a
						href={ domainOnlySiteCreationLink( siteSlug, site.ID ) }
						aria-label={ __( 'Create a site for this domain' ) }
					/>
				),
				connect: (
					<a
						href={ domainManagementTransferToOtherSiteLink( siteSlug, currentDomainData.domain ) }
						aria-label={ __( 'Connect this domain to an existing site' ) }
					/>
				),
				ariaHidden: <span aria-hidden={ true } />,
			}
		);
	}

	return site.name ?? '-';
};
