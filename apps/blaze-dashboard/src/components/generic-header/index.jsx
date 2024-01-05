import config from '@automattic/calypso-config';
import JetpackBlazeHeader from '../jetpack-blaze-header';
import WooBlazeHeader from '../woo-blaze-header';

const GenericHeader = () => {
	const isWooBlaze = config.isEnabled( 'is_running_in_woo_site' );
	return isWooBlaze ? <WooBlazeHeader /> : <JetpackBlazeHeader />;
};
export default GenericHeader;
