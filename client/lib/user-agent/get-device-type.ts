import { once } from 'lodash';
import UserAgent from 'ua-parser-js';

export const getDeviceType = () =>
	new UserAgent( globalThis.navigator?.userAgent ).getDevice().type;

export default once( getDeviceType );
