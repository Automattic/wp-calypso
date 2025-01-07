import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import {
	domainManagementAllEmailRoot,
	domainManagementOverviewRoot,
} from 'calypso/my-sites/domains/paths';
import { CustomHeaderComponentType } from './custom-header-component-type';

const AddMailboxHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();
	return (
		<>
			<NavigationHeader
				className="navigation-header__breadcrumb"
				navigationItems={ [
					{
						label: selectedDomainName,
						href: `${ domainManagementOverviewRoot() }/${ selectedDomainName }/${ selectedSiteSlug }`,
					},
					{
						label: 'Emails',
						href: `${ domainManagementAllEmailRoot() }/${ selectedDomainName }/${ selectedSiteSlug }`,
					},
					{
						label: translate( 'Add new mailbox' ),
					},
				] }
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
