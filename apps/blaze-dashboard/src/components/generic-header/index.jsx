import config from '@automattic/calypso-config';
import BlazePluginHeader from './blaze-plugin-header';
import JetpackBlazeHeader from './jetpack-blaze-header';

const GenericHeader = ( props ) => {
	const isBlazePlugin = config.isEnabled( 'is_running_in_blaze_plugin' );
	return isBlazePlugin ? <BlazePluginHeader { ...props } /> : <JetpackBlazeHeader { ...props } />;
};
export default GenericHeader;
