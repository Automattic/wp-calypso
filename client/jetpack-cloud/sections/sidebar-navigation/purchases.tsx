import page from '@automattic/calypso-router';
import { chevronLeft, formatListBulletsRTL, payment, receipt, store } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import NewSidebar from 'calypso/jetpack-cloud/components/sidebar';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_MANAGE_BILLING_LINK,
	JETPACK_MANAGE_COMPANY_DETAILS_LINK,
	JETPACK_MANAGE_DASHBOARD_LINK,
	JETPACK_MANAGE_INVOICES_LINK,
	JETPACK_MANAGE_PARTNER_PORTAL_LINK,
	JETPACK_MANAGE_PAYMENT_METHODS_LINK,
} from './lib/constants';
import { MenuItemProps } from './types';

const PurchasesSidebar = ( { path }: { path: string } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const createItem = ( props: Omit< MenuItemProps, 'path' > ) => ( {
		...props,
		path: JETPACK_MANAGE_PARTNER_PORTAL_LINK,
		trackEventName: 'calypso_jetpack_sidebar_menu_click',
		isSelected: itemLinkMatches( props.link, path ),
	} );

	const menuItems = [
		createItem( {
			icon: store,
			link: JETPACK_MANAGE_BILLING_LINK,
			title: translate( 'Billing' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Partner Portal / Billing',
			},
		} ),
		createItem( {
			icon: payment,
			link: JETPACK_MANAGE_PAYMENT_METHODS_LINK,
			title: translate( 'Payment Methods' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Partner Portal / Payment Methods',
			},
		} ),
		createItem( {
			icon: receipt,
			link: JETPACK_MANAGE_INVOICES_LINK,
			title: translate( 'Invoices' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Partner Portal / Invoices',
			},
		} ),
		createItem( {
			icon: formatListBulletsRTL,
			link: JETPACK_MANAGE_COMPANY_DETAILS_LINK,
			title: translate( 'Company Details' ),
			trackEventProps: {
				menu_item: 'Jetpack Cloud / Partner Portal / Company Details',
			},
		} ),
	];

	return (
		<NewSidebar
			isJetpackManage
			path={ JETPACK_MANAGE_PARTNER_PORTAL_LINK }
			menuItems={ menuItems }
			title={ translate( 'Purchases' ) }
			description={ translate( 'Manage all your billing related settings from one place.' ) }
			backButtonProps={ {
				label: translate( 'Back to Sites' ),
				icon: chevronLeft,
				onClick: () => {
					dispatch(
						recordTracksEvent( 'calypso_jetpack_sidebar_new_purchases_back_button_click' )
					);

					page( JETPACK_MANAGE_DASHBOARD_LINK );
				},
			} }
		/>
	);
};

export default PurchasesSidebar;
