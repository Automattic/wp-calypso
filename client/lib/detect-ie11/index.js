export const isIE11Detected = (
	window &&
	window.MSInputMethodContext &&
	document &&
	document.documentMode
);

export default isIE11Detected;
