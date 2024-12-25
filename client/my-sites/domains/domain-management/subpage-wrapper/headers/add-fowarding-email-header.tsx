import { useTranslate } from 'i18n-calypso';
import NavigationHeader from 'calypso/components/navigation-header';
import { CustomHeaderComponentType } from './custom-header-component-type';

const AddForwardingEmailHeader: CustomHeaderComponentType = ( {
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
						href: `/domains/manage/all/email/${ selectedDomainName }/${ selectedSiteSlug }`,
					},
					{
						label: translate( 'Add email forwarding' ),
					},
				] }
			/>
			<NavigationHeader
				className="navigation-header__title"
				title={ translate( 'Add new email forwarding' ) }
				subtitle={ translate( 'Seamlessly redirect your messages to where you need them.' ) }
			/>
		</>
	);
};

export default AddForwardingEmailHeader;
