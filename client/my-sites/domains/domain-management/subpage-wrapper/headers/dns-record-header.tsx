import { localizeUrl } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { translate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import ExternalLink from 'calypso/components/external-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { domainManagementAllOverview, domainManagementDns } from 'calypso/my-sites/domains/paths';
import SiteIcon from 'calypso/sites/components/sites-dataviews/site-icon';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSite } from 'calypso/state/sites/selectors';
import { CustomHeaderComponentType } from './custom-header-component-type';

export const addDnsRecordTitle = translate( 'Add a new DNS record' );
export const editDnsRecordTitle = translate( 'Edit DNS record' );
export const addDnsRecordsSubtitle = translate(
	'DNS records change how your domain works. {{a}}Learn more{{/a}}.',
	{
		components: {
			a: (
				<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' ) } />
			),
		},
	}
);

const DnsRecordHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
	context = 'add',
	inSiteContext,
} ) => {
	const site = useSelector( ( state ) => getSite( state, selectedSiteSlug ) as SiteExcerptData );
	const currentRoute = useSelector( getCurrentRoute );

	const navigationItems = useMemo( () => {
		const baseNavigationItems = [
			{
				label: selectedDomainName,
				href: domainManagementAllOverview(
					selectedSiteSlug,
					selectedDomainName,
					null,
					inSiteContext
				),
				className: 'navigation-header__domain-name',
			},
			{
				label: translate( 'DNS records' ),
				href: domainManagementDns( selectedSiteSlug, selectedDomainName, currentRoute ),
			},
			{
				label: context === 'add' ? addDnsRecordTitle : editDnsRecordTitle,
			},
		];

		if ( inSiteContext ) {
			return [
				{
					label: site?.name || selectedDomainName,
					href: `/overview/${ selectedSiteSlug }`,
					icon: <SiteIcon site={ site } viewType="breadcrumb" disableClick />,
				},
				...baseNavigationItems,
			];
		}

		return baseNavigationItems;
	}, [ context, currentRoute, inSiteContext, selectedDomainName, selectedSiteSlug, site ] );

	return (
		<NavigationHeader
			className="navigation-header__breadcrumb"
			navigationItems={ navigationItems }
			title={ translate( 'DNS records' ) }
			subtitle={ addDnsRecordsSubtitle }
		/>
	);
};

export default DnsRecordHeader;
