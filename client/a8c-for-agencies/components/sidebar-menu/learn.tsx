import page from '@automattic/calypso-router';
import { chevronLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Sidebar from '../sidebar';
import useLearnMenuItems from './hooks/use-learn-menu-items';
import { A4A_OVERVIEW_LINK, A4A_RESOURCES_LINK } from './lib/constants';

type Props = {
	path: string;
};

export default function LearnSidebar( { path }: Props ) {
	const translate = useTranslate();
	const menuItems = useLearnMenuItems( path );

	return (
		<Sidebar
			path={ A4A_RESOURCES_LINK }
			title={ translate( 'Resources and tools' ) }
			description={ translate( 'Grow your agency and deliver better client work.' ) }
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
