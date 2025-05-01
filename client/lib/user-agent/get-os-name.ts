import { once } from 'lodash';
import UserAgent from 'ua-parser-js';

export const getOsName = () => new UserAgent( globalThis.navigator?.userAgent ).getOS().name;

export default once( getOsName );
