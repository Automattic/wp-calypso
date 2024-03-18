import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';

export default function Checkout() {
	const translate = useTranslate();

	return (
		<Layout
			className="checkout"
			title={ translate( 'Product Marketplace' ) }
			wide
			withBorder
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Marketplace' ) } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>checkout</LayoutBody>
		</Layout>
	);
}
