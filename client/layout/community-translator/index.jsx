import config from '@automattic/calypso-config';
import CommunityTranslatorLauncher from 'calypso/layout/community-translator/launcher';

export default function CommunityTranslatorMain() {
	if ( config( 'restricted_me_access' ) ) {
		return <CommunityTranslatorLauncher />;
	}

	return null;
}
