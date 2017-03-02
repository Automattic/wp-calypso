export const isIE11 = (
	window &&
	window.MSInputMethodContext &&
	document &&
	document.documentMode
);

export default isIE11;
