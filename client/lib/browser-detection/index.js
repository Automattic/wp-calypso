/**
 * External dependencies
 */
import { isUndefined } from 'lodash';

export const isFirefox = ! isUndefined( window.InstallTrigger );

export const isIE11 = (
	window &&
	window.MSInputMethodContext &&
	document &&
	document.documentMode
);
