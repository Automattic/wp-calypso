import {
	Card,
	CardHeader,
	CardBody,
	ToggleControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { ProfileTab } from 'calypso/reader/data/user-profile';

interface ProfileVisibilityCardProps {
	achievementsVisible: boolean;
	postsVisible: boolean;
	sitesVisible: boolean;
	onChange: ( tab: ProfileTab, visible: boolean ) => void;
	onChangeAchievements: ( visible: boolean ) => void;
}

export default function ProfileVisibilityCard( {
	achievementsVisible,
	postsVisible,
	sitesVisible,
	onChange,
	onChangeAchievements,
}: ProfileVisibilityCardProps ): JSX.Element {
	const translate = useTranslate();

	return (
		<Card>
			<CardHeader>
				<h2 className="user-profile-settings__card-title">{ translate( 'Profile tabs' ) }</h2>
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 }>
					<ToggleControl
						checked={ postsVisible }
						onChange={ ( checked ) => onChange( 'posts', checked ) }
						label={ translate( 'Show Posts tab' ) }
						help={ translate( 'When off, the Posts tab is hidden from your public profile.' ) }
					/>
					<ToggleControl
						checked={ sitesVisible }
						onChange={ ( checked ) => onChange( 'sites', checked ) }
						label={ translate( 'Show Sites tab' ) }
						help={ translate( 'When off, the Sites tab is hidden from your public profile.' ) }
					/>
					<ToggleControl
						checked={ achievementsVisible }
						onChange={ onChangeAchievements }
						label={ translate( 'Show Achievements tab' ) }
						help={ translate(
							'When off, the Achievements tab is hidden from your public profile.'
						) }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}
