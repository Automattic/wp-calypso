import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useAmplifyMenuItems from './hooks/use-amplify-menu-items';
import { A4A_AMPLIFY_LINK, A4A_OVERVIEW_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function AmplifySidebar( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useAmplifyMenuItems( path );

	return (
		<Sidebar
			path={ A4A_AMPLIFY_LINK }
			title={ translate( 'Amplify' ) }
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
