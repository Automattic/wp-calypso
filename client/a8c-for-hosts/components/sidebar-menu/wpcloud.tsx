import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useWPCloudMenuItems from './hooks/use-wpcloud-menu-items';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useWPCloudMenuItems( path );

	return (
		<Sidebar
			path="/wpcloud"
			title={ translate( 'WP Cloud' ) }
			description={ translate( 'WP Cloud partner account management portal.' ) }
			backButtonProps={ {
				label: translate( 'Back to Automattic partner portal' ),
				icon: chevronLeft,
				onClick: () => {
					page( '/' );
				},
			} }
			menuItems={ menuItems }
			disableSubmenus
		/>
	);
}
