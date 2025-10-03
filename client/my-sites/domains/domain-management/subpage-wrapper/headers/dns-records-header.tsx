import { SiteExcerptData } from '@automattic/sites';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { domainManagementAllOverview } from 'calypso/my-sites/domains/paths';
import SiteIcon from 'calypso/sites/components/sites-dataviews/site-icon';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { CustomHeaderComponentType } from './custom-header-component-type';

// Override the title and subtitle for the DNS records page
const dnsRecordsTitle = translate( 'DNS records' );
const dnsRecordsSubtitle = translate(
	'DNS records change how your domain works. {{a}}Learn more{{/a}}.',
	{
		components: {
			a: <InlineSupportLink supportContext="manage-your-dns-records" showIcon={ false } />,
		},
	}
);

const DNSRecordsHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
	inSiteContext,
} ) => {
	const site = useSelector( ( state ) => getSite( state, selectedSiteSlug ) as SiteExcerptData );

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
				label: dnsRecordsTitle,
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
	}, [ inSiteContext, selectedDomainName, selectedSiteSlug, site ] );

	return (
		<NavigationHeader
			className="navigation-header__breadcrumb"
			navigationItems={ navigationItems }
			title={ dnsRecordsTitle }
			subtitle={ dnsRecordsSubtitle }
		/>
	);
};

export default DNSRecordsHeader;

export { dnsRecordsTitle, dnsRecordsSubtitle };
