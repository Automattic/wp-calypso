import { User } from '@automattic/api-core';
import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import { wpcomLink } from '../../utils/link';
import { AppConfigSupports } from '../context';
import HelpCenterCTA from './help-center-cta';
import NotificationsDropdown from './notifications-dropdown';
import UserProfileDropdown from './user-profile-dropdown';

import './style.scss';

interface SecondaryMenuProps {
	supports: Partial< AppConfigSupports >;
	user: User;
	logout: () => Promise< void >;
	navigateTo: ( path: string ) => void;
	recordTracksEvent: ( eventName: string, args?: Record< string, unknown > ) => void;
}

function SecondaryMenu( props: SecondaryMenuProps ): JSX.Element {
	const { recordTracksEvent, supports, user } = props;
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
			{ supports.help && <HelpCenterCTA user={ user } recordTracksEvent={ recordTracksEvent } /> }
			{ supports.notifications && (
				<NotificationsDropdown
					className="dashboard-secondary-menu__item"
					user={ user }
					navigateTo={ props.navigateTo }
				/>
			) }
			<UserProfileDropdown
				user={ user }
				logout={ props.logout }
				navigateTo={ props.navigateTo }
				recordTracksEvent={ recordTracksEvent }
			/>
		</HStack>
	);
}

export default SecondaryMenu;
