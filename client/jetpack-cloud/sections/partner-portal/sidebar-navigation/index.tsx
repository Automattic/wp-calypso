import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { useSelector } from 'calypso/state';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import './style.scss';

export default function PartnerPortalSidebarNavigation() {
	const headerTitle = useSelector( getDocumentHeadTitle );

	return <SidebarNavigation sectionTitle={ headerTitle } />;
}
