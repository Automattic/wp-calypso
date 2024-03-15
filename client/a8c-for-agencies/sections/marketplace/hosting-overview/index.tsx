import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useShoppingCart from '../hooks/use-shopping-cart';
import ShoppingCart from '../shopping-cart';
import { ShoppingCartItem } from '../types';

export default function Hosting() {
	const translate = useTranslate();

	const { selectedItems, setSelectedItems } = useShoppingCart();

	return (
		<Layout
			className={ classNames( 'hosting-overview' ) }
			title={ translate( 'Hosting Marketplace' ) }
			wide
			withBorder
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Marketplace' ) }</Title>

					<Actions>
						<ShoppingCart
							items={ selectedItems }
							onRemoveItem={ ( item: ShoppingCartItem ) => {
								setSelectedItems(
									selectedItems.filter( ( selectedItem ) => selectedItem !== item )
								);
							} }
							onCheckout={ () => {
								/* FIXME: redirect to checkout page */
							} }
						/>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>Hosting here</LayoutBody>
		</Layout>
	);
}
