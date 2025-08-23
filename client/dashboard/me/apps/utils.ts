const IOS_REGEX = /iPad|iPod|iPhone/i;
const ANDROID_REGEX = /Android (\d+(\.\d+)?(\.\d+)?)/i;

export function isIOS() {
	if ( typeof navigator === 'undefined' || typeof navigator.userAgent === 'undefined' ) {
		return false;
	}

	return IOS_REGEX.test( navigator.userAgent );
}

export function isAndroid() {
	if ( typeof navigator === 'undefined' || typeof navigator.userAgent === 'undefined' ) {
		return false;
	}

	return ANDROID_REGEX.test( navigator.userAgent );
}

export function isMobile() {
	return isIOS() || isAndroid();
}
