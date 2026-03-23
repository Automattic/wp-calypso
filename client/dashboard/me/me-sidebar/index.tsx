import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import MeMenu from '../me-menu';

import './style.scss';

export default function MeSidebar() {
	const { data: userSettings } = useQuery( userSettingsQuery() );

	if ( ! userSettings ) {
		return null;
	}

	return (
		<VStack spacing={ 4 }>
			<HStack justify="flex-start" alignment="center" spacing={ 3 }>
				<div className="me-sidebar__avatar-wrapper">
					<div className="me-sidebar__avatar">
						<img src={ userSettings.avatar_URL } alt={ __( 'Profile photo' ) } />
					</div>
				</div>
				<VStack spacing={ 0 } style={ { minWidth: 0 } }>
					<Text weight={ 500 } size="13px" truncate>
						{ userSettings.display_name }
					</Text>
					<Text variant="muted" size="12px" truncate>
						@{ userSettings.user_login }
					</Text>
				</VStack>
			</HStack>
			<MeMenu />
		</VStack>
	);
}
