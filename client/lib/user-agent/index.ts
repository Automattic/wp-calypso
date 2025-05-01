import getDeviceType from './get-device-type';
import getOsName from './get-os-name';

export const isAndroid = (): boolean => getOsName() === 'Android';
export const isIos = (): boolean => getOsName() === 'iOS';
export const isMobile = (): boolean => getDeviceType() === 'mobile';
export const isTablet = (): boolean => getDeviceType() === 'tablet';
export const isDesktop = (): boolean => getDeviceType() === undefined;
