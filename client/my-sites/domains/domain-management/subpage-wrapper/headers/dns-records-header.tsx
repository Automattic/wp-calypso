import { localizeUrl } from '@automattic/i18n-utils';
import { SiteExcerptData } from '@automattic/sites';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import ExternalLink from 'calypso/components/external-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { domainManagementAllOverview } from 'calypso/my-sites/domains/paths';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import SiteIcon from 'calypso/sites/components/sites-dataviews/site-icon';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSite } from 'calypso/state/sites/selectors';
import { CustomHeaderComponentType } from './custom-header-component-type';

// Override the title and subtitle for the DNS records page
const dnsRecordsTitle = translate( 'DNS records' );
const dnsRecordsSubtitle = translate(
	'DNS records change how your domain works. {{a}}Learn more{{/a}}.',
	{
		components: {
			a: (
				<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' ) } />
			),
		},
	}
);

const DNSRecordsHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
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
			},
			{
				label: translate( 'Email' ),
				href: getEmailManagementPath( selectedSiteSlug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'DNS records' ),
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
	}, [ inSiteContext, selectedDomainName, selectedSiteSlug, site, translate ] );

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
