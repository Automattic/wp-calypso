import { JetpackLogo, WooLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import LayoutNavigation, {
	LayoutNavigationItemProps,
	LayoutNavigationTabs,
} from 'calypso/a8c-for-agencies/components/layout/nav';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useProductAndPlans from '../../hooks/use-product-and-plans';

export default function ProductNavigation() {
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
				key: 'all',
				label: translate( 'All' ),
				count: totalWooCommerceProducts + totalJetpackProducts,
			},
		];

		if ( totalJetpackProducts ) {
			items.push( {
				key: 'jetpack',
				label: translate( 'Jetpack' ),
				icon: <JetpackLogo size={ 18 } />,
				count: totalJetpackProducts,
			} );
		}

		if ( totalWooCommerceProducts ) {
			items.push( {
				key: 'woocommerce',
				label: translate( 'Woo' ),
				icon: <WooLogo />,
				count: totalWooCommerceProducts,
			} );
		}

		return items.map( ( navItem ) => ( {
			...navItem,
			selected: navItem.key === 'all',
			path: `${ A4A_MARKETPLACE_PRODUCTS_LINK }/${ navItem.key }`,
			onClick: () => {
				dispatch(
					recordTracksEvent( 'calypso_a4a_product_brand_navigation_click', {
						status: navItem.key,
					} )
				);
			},
			children: navItem.label,
		} ) );
	}, [ dispatch, totalJetpackProducts, totalWooCommerceProducts, translate ] );

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
