import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';

export default function Overview() {
	const translate = useTranslate();

	return (
		<Layout title="Overview" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Agency HQ Overview' ) }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div>test</div>
			</LayoutBody>
		</Layout>
	);
}
