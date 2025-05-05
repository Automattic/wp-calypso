import UserAgent from 'ua-parser-js';
import { once } from 'calypso/lib/memoize-last';

export const getOsName = () => new UserAgent( globalThis.navigator?.userAgent ).getOS().name;

export default once( getOsName );
