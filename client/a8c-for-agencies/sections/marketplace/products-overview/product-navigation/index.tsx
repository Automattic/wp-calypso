import { JetpackLogo, WooLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutNavigation, {
	LayoutNavigationItemProps,
	LayoutNavigationTabs,
	buildNavItems,
} from 'calypso/layout/multi-sites-dashboard/nav';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	PRODUCT_BRAND_FILTER_ALL,
	PRODUCT_BRAND_FILTER_JETPACK,
	PRODUCT_BRAND_FILTER_WOOCOMMERCE,
} from '../../constants';
import useProductAndPlans from '../../hooks/use-product-and-plans';

type Props = {
	selectedTab?: string;
};

export default function ProductNavigation( { selectedTab }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { data } = useProductAndPlans( {} );

	const totalJetpackProducts =
		data?.filter( ( product ) => product.slug.startsWith( 'jetpack' ) ).length ?? 0;

	const totalWooCommerceProducts =
		data?.filter( ( product ) => product.slug.startsWith( 'woocommerce' ) ).length ?? 0;

	const navItems = useMemo( () => {
		const items: LayoutNavigationItemProps[] = [
			{
				key: PRODUCT_BRAND_FILTER_ALL,
				label: translate( 'All' ),
				count: totalWooCommerceProducts + totalJetpackProducts,
			},
		];

		if ( totalWooCommerceProducts ) {
			items.push( {
				key: PRODUCT_BRAND_FILTER_WOOCOMMERCE,
				label: translate( 'Woo' ),
				icon: <WooLogo />,
				count: totalWooCommerceProducts,
			} );
		}

		if ( totalJetpackProducts ) {
			items.push( {
				key: PRODUCT_BRAND_FILTER_JETPACK,
				label: translate( 'Jetpack' ),
				icon: <JetpackLogo size={ 18 } />,
				count: totalJetpackProducts,
			} );
		}

		return buildNavItems( {
			items,
			basePath: A4A_MARKETPLACE_PRODUCTS_LINK,
			selectedKey: selectedTab ?? '',
			onItemClick: () => {
				dispatch(
					recordTracksEvent( 'calypso_a4a_product_brand_navigation_click', {
						status: selectedTab,
					} )
				);
			},
		} );
	}, [ dispatch, selectedTab, totalJetpackProducts, totalWooCommerceProducts, translate ] );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];
	const selectedItemProps = {
		selectedText: selectedItem.label,
		selectedCount: selectedItem.count,
	};

	return (
		<LayoutNavigation { ...selectedItemProps }>
			<LayoutNavigationTabs { ...selectedItemProps } items={ navItems } />
		</LayoutNavigation>
	);
}
