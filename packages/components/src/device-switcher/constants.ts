export const DEVICE_TYPES = {
	COMPUTER: 'computer',
	TABLET: 'tablet',
	PHONE: 'phone',
} as const;

export const DEVICES_SUPPORTED = [ DEVICE_TYPES.COMPUTER, DEVICE_TYPES.TABLET, DEVICE_TYPES.PHONE ];
