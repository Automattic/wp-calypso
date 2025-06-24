declare module '*.svg' {
	const url: string;
	export default url;
}

declare const __i18n_text_domain__: string;

declare module '*.module.css' {
	const classes: { [ key: string ]: string };
	export default classes;
}
declare module '*.module.scss' {
	const classes: { [ key: string ]: string };
	export default classes;
}
