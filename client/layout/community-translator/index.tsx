import config from '@automattic/calypso-config';
import CommunityTranslatorLauncher from './launcher';

const CommunityTranslator = config( 'restricted_me_access' ) ? CommunityTranslatorLauncher : null;

export default CommunityTranslator;
