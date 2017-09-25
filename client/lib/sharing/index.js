/**
 * Internal dependencies
 */
import PopupMonitor from 'lib/popup-monitor';

const requestExternalAccess = ( url, cb ) => {
	const popupMonitor = new PopupMonitor();

	popupMonitor.open( url, null, 'toolbar=0,location=0,status=0,menubar=0,' +
		popupMonitor.getScreenCenterSpecs( 780, 500 ) );

	popupMonitor.once( 'close', cb );
};

export default requestExternalAccess;
