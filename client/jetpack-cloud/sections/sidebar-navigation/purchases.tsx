import { chevronLeft, formatListBulletsRTL, payment, receipt, store, tag } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import {
	JETPACK_MANAGE_BILLING_LINK,
	JETPACK_MANAGE_COMPANY_DETAILS_LINK,
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_INVOICES_LINK,
	JETPACK_MANAGE_PARTNER_PORTAL_LINK,
	JETPACK_MANAGE_PAYMENT_METHODS_LINK,
	JETPACK_MANAGE_PRICES_LINK,
} from './lib/constants';
import { isMenuItemSelected, redirectPage } from './lib/sidebar';
import { MenuItemProps } from './types';

const createItem = ( props: Omit< MenuItemProps, 'path' > ) => ( {
	...props,
	path: JETPACK_MANAGE_PARTNER_PORTAL_LINK,
	onClickMenuItem: redirectPage,
	isSelected: isMenuItemSelected( props.link ),
} );

const PurchasesSidebar = () => {
	const translate = useTranslate();

	const menuItems = [
		createItem( {
			icon: store,
			link: JETPACK_MANAGE_BILLING_LINK,
			title: translate( 'Billing' ),
		} ),
		createItem( {
			icon: payment,
			link: JETPACK_MANAGE_PAYMENT_METHODS_LINK,
			title: translate( 'Payment Methods' ),
		} ),
		createItem( {
			icon: receipt,
			link: JETPACK_MANAGE_INVOICES_LINK,
			title: translate( 'Invoices' ),
		} ),
		createItem( {
			icon: tag,
			link: JETPACK_MANAGE_PRICES_LINK,
			title: translate( 'Prices' ),
		} ),
		createItem( {
			icon: formatListBulletsRTL,
			link: JETPACK_MANAGE_COMPANY_DETAILS_LINK,
			title: translate( 'Company Details' ),
		} ),
	];

	return (
		<NewSidebar
			isJetpackManage
			path={ JETPACK_MANAGE_PARTNER_PORTAL_LINK }
			menuItems={ menuItems }
			description={ translate( 'Manage all your billing related settings from one place.' ) }
			backButtonProps={ {
				label: translate( 'Purchases' ),
				icon: chevronLeft,
				onClick: () => redirectPage( JETPACK_MANAGE_DASHBOARD_LINK ),
			} }
		/>
	);
};

export default PurchasesSidebar;
