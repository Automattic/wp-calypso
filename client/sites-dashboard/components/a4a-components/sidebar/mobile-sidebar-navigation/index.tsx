import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { useSelector } from 'calypso/state';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';

export default function MobileSidebarNavigation() {
	const headerTitle = useSelector( getDocumentHeadTitle );

	return <SidebarNavigation sectionTitle={ headerTitle } />;
}
