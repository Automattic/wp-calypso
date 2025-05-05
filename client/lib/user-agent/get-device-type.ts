import UserAgent from 'ua-parser-js';
import { once } from 'calypso/lib/memoize-last';

export const getDeviceType = () =>
	new UserAgent( globalThis.navigator?.userAgent ).getDevice().type;

export default once( getDeviceType );
