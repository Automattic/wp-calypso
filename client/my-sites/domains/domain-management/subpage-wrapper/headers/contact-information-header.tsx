import { SiteExcerptData } from '@automattic/sites';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import { domainManagementAllOverview } from 'calypso/my-sites/domains/paths';
import SiteIcon from 'calypso/sites/components/sites-dataviews/site-icon';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { CustomHeaderComponentType } from './custom-header-component-type';

const ContactInformationHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
	inSiteContext,
} ) => {
	const translate = useTranslate();
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
			},
			{
				label: translate( 'Contact information' ),
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
		<>
			<NavigationHeader
				className="navigation-header__breadcrumb"
				navigationItems={ navigationItems }
			/>
			<NavigationHeader
				className="navigation-header__title"
				title={ translate( 'Contact information' ) }
				subtitle={ translate( "Manage your domain's contact details." ) }
			/>
		</>
	);
};

export default ContactInformationHeader;
