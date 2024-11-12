import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useMigrationsMenuItems from './hooks/use-migrations-menu-items';
import { A4A_OVERVIEW_LINK, A4A_MIGRATIONS_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function ( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useMigrationsMenuItems( path );

	return (
		<Sidebar
			path={ A4A_MIGRATIONS_LINK }
			title={ translate( 'Migrations' ) }
			backButtonProps={ {
				label: translate( 'Back to overview' ),
				icon: chevronLeft,
				onClick: () => {
					page( A4A_OVERVIEW_LINK );
				},
			} }
			menuItems={ menuItems }
			withUserProfileFooter
		/>
	);
}
