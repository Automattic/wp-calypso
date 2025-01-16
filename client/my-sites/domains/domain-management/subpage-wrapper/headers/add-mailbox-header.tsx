import { SiteExcerptData } from '@automattic/sites';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import { domainManagementOverviewRoot } from 'calypso/my-sites/domains/paths';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import SiteIcon from 'calypso/sites/components/sites-dataviews/site-icon';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSite } from 'calypso/state/sites/selectors';
import { CustomHeaderComponentType } from './custom-header-component-type';

const AddMailboxHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
	inSiteContext,
} ) => {
	const translate = useTranslate();
	const site = useSelector( ( state ) => getSite( state, selectedSiteSlug ) as SiteExcerptData );
	const currentRoute = useSelector( getCurrentRoute );

	const navigationItems = useMemo( () => {
		const baseNavigationItems = [
			{
				label: selectedDomainName,
				href: `${ domainManagementOverviewRoot() }/${ selectedDomainName }/${ selectedSiteSlug }`,
			},
			{
				label: translate( 'Email' ),
				href: getEmailManagementPath( selectedSiteSlug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Add new mailbox' ),
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
	}, [ currentRoute, inSiteContext, selectedDomainName, selectedSiteSlug, site, translate ] );

	return (
		<>
			<NavigationHeader
				className="navigation-header__breadcrumb"
				navigationItems={ navigationItems }
			/>
			<NavigationHeader
				className="navigation-header__title"
				title={ translate( 'Add new Mailboxes' ) }
				subtitle={ translate( 'Integrated email solution with powerful features.' ) }
			/>
		</>
	);
};

export default AddMailboxHeader;
