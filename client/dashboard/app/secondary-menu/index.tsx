import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { wpcomLink } from '../../utils/link';
import { useAppContext } from '../context';
import HelpCenterCTA from './help-center-cta';
import NotificationsDropdown from './notifications-dropdown';
import UserProfileDropdown from './user-profile-dropdown';

import './style.scss';

function SecondaryMenu() {
	const { supports } = useAppContext();
	const isDesktop = useViewportMatch( 'medium' );

	return (
		<HStack spacing={ isDesktop ? 2 : 0 } justify="flex-end">
			{ supports.reader && (
				<Button
					className="dashboard-secondary-menu__item"
					icon={ <ReaderIcon /> }
					label={ __( 'Reader' ) }
					text={ isDesktop ? __( 'Reader' ) : undefined }
					href={ wpcomLink( '/reader' ) }
				/>
			) }
			{ supports.help && <HelpCenterCTA /> }
			{ supports.notifications && (
				<NotificationsDropdown className="dashboard-secondary-menu__item" />
			) }
			<UserProfileDropdown />
		</HStack>
	);
}

export default SecondaryMenu;
