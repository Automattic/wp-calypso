import page from '@automattic/calypso-router';
import { chevronLeft, key, store } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Sidebar from '../sidebar';
import {
	A4A_OVERVIEW_LINK,
	A4A_PURCHASES_LINK,
	A4A_LICENSES_LINK,
	A4A_BILLING_LINK,
} from './lib/constants';
import { createItem } from './lib/utils';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();

	const menuItems = useMemo( () => {
		return [
			createItem(
				{
					icon: key,
					path: A4A_PURCHASES_LINK,
					link: A4A_LICENSES_LINK,
					title: translate( 'Licenses' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Licenses',
					},
				},
				path
			),
			createItem(
				{
					icon: store,
					path: A4A_PURCHASES_LINK,
					link: A4A_BILLING_LINK,
					title: translate( 'Billing' ),
					trackEventProps: {
						menu_item: 'Automattic for Agencies / Purchases / Billing',
					},
				},
				path
			),
		].map( ( item ) => createItem( item, path ) );
	}, [ path, translate ] );

	return (
		<Sidebar
			path={ A4A_PURCHASES_LINK }
			title={ translate( 'Purchases' ) }
			description={ translate( 'Manage all your billing related settings from one place.' ) }
			backButtonProps={ {
				label: translate( 'Back to overview' ),
				icon: chevronLeft,
				onClick: () => {
					page( A4A_OVERVIEW_LINK );
				},
			} }
			menuItems={ menuItems }
			withSiteSelector
			withGetHelpLink
		/>
	);
}
