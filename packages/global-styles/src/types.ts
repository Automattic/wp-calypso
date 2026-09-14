import type { GlobalStylesObject } from '@automattic/design-types';
export type { Color, FontFamily, GlobalStylesObject, Typography } from '@automattic/design-types';

export type SetConfigCallback = ( config: GlobalStylesObject ) => GlobalStylesObject;

export type SetConfig = ( callback: SetConfigCallback ) => void;

export interface GlobalStylesContextObject {
	user?: GlobalStylesObject;
	base: GlobalStylesObject;
	merged?: GlobalStylesObject;
	setUserConfig?: SetConfig;
	isReady?: boolean;
}

export enum GlobalStylesVariationType {
	Free = 'free',
	Premium = 'premium',
}
