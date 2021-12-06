import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import CommunityTranslator from 'calypso/components/community-translator';
import CommunityTranslatorLauncher from 'calypso/layout/community-translator/launcher';
import isCommunityTranslatorEnabled from 'calypso/state/selectors/is-community-translator-enabled';

export default function CommunityTranslatorMain() {
	const communityTranslatorEnabled = useSelector( isCommunityTranslatorEnabled );

	if ( config.isEnabled( 'i18n/community-translator' ) && communityTranslatorEnabled ) {
		return <CommunityTranslator />;
	} else if ( config( 'restricted_me_access' ) ) {
		return <CommunityTranslatorLauncher />;
	}

	return null;
}
