import { chevronLeft, formatListBulletsRTL, payment, receipt, store, tag } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';

const PurchasesSidebar = () => {
	const translate = useTranslate();

	const onClickMenuItem = ( path: string ) => {
		page.redirect( path );
	};

	const menuItems = [
		{
			icon: store,
			path: '/partner-portal',
			link: '/partner-portal/billing',
			title: translate( 'Billing' ),
			onClickMenuItem: onClickMenuItem,
		},
		{
			icon: payment,
			path: '/partner-portal',
			link: '/partner-portal/payment-methods',
			title: translate( 'Payment Methods' ),
			onClickMenuItem: onClickMenuItem,
		},
		{
			icon: receipt,
			path: '/partner-portal',
			link: '/partner-portal/invoices',
			title: translate( 'Invoices' ),
			onClickMenuItem: onClickMenuItem,
		},
		{
			icon: tag,
			path: '/partner-portal',
			link: '/partner-portal/prices',
			title: translate( 'Prices' ),
			onClickMenuItem: onClickMenuItem,
		},
		{
			icon: formatListBulletsRTL,
			path: '/partner-portal',
			link: '/partner-portal/company-details',
			title: translate( 'Company Details' ),
			onClickMenuItem: onClickMenuItem,
		},
	];
	return (
		<NewSidebar
			isJetpackManage
			path="/partner-portal"
			menuItems={ menuItems }
			description={ translate( 'Manage all your billing related settings from one place.' ) }
			backButtonProps={ {
				label: translate( 'Purchases' ),
				icon: chevronLeft,
				onClick: () => onClickMenuItem( '/dashboard' ),
			} }
		/>
	);
};

export default PurchasesSidebar;
