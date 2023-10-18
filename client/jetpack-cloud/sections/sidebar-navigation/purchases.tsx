import { chevronLeft, formatListBulletsRTL, payment, receipt, store, tag } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';

const PARTNER_PORTAL_ROOT_PATH = '/partner-portal';

const onClickMenuItem = ( path: string ) => {
	page.redirect( path );
};

const isSelected = ( link: string ) => {
	const pathname = window.location.pathname;
	return itemLinkMatches( link, pathname );
};

type ItemProps = {
	icon: JSX.Element;
	link: string;
	title: string;
};
const createItem = ( { icon, link, title }: ItemProps ) => ( {
	icon,
	path: PARTNER_PORTAL_ROOT_PATH,
	link,
	title,
	onClickMenuItem,
	isSelected: isSelected( link ),
} );

const PurchasesSidebar = () => {
	const translate = useTranslate();

	const menuItems = [
		createItem( {
			icon: store,
			link: `${ PARTNER_PORTAL_ROOT_PATH }/billing`,
			title: translate( 'Billing' ),
		} ),
		createItem( {
			icon: payment,
			link: `${ PARTNER_PORTAL_ROOT_PATH }/payment-methods`,
			title: translate( 'Payment Methods' ),
		} ),
		createItem( {
			icon: receipt,
			link: `${ PARTNER_PORTAL_ROOT_PATH }/invoices`,
			title: translate( 'Invoices' ),
		} ),
		createItem( {
			icon: tag,
			link: `${ PARTNER_PORTAL_ROOT_PATH }/prices`,
			title: translate( 'Prices' ),
		} ),
		createItem( {
			icon: formatListBulletsRTL,
			link: `${ PARTNER_PORTAL_ROOT_PATH }/company-details`,
			title: translate( 'Company Details' ),
		} ),
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
